"""The static data endpoints the frontend loads every screen from."""

import json
import shutil

import pytest

from app.data.store import DATA_DIR, DataStore

API = "/api/v1"


def get(client, path):
    res = client.get(f"{API}{path}")
    assert res.status_code == 200, res.text
    return res.json()


def test_workspace_persona(client):
    body = get(client, "/workspace")
    assert body == {
        "name": "Nora Vance",
        "role": "Finance Operations",
        "email": "nora.vance@harborlight.example",
        "company": "Harborlight Group",
    }


def test_clients_are_camel_case_and_complete(client):
    items = get(client, "/clients")["items"]
    assert len(items) == 10
    first = items[0]
    assert first == {
        "code": "ARVX",
        "name": "Arvex Labs",
        "industry": "Biotech",
        "regions": 18,
        "openClaims": 212,
        "ytdPaid": 4_612_000,
    }
    # largest first, as the screen lists them
    paid = [c["ytdPaid"] for c in items]
    assert paid == sorted(paid, reverse=True)


def test_recent_claims(client):
    items = get(client, "/claims/recent")["items"]
    assert len(items) == 8
    assert items[0]["claimNo"] == "HLG-24381"
    assert items[0]["paid"] == 86_400
    assert {c["status"] for c in items} <= {"Open", "Review", "Settled"}


def test_reports_catalog(client):
    items = get(client, "/reports")["items"]
    assert len(items) == 10
    assert items[0]["key"] == "program-spend"
    assert [r["live"] for r in items].count(False) == 1
    assert items[0]["lastOpened"] == "Today, 9:14"


def test_activity(client):
    items = get(client, "/activity")["items"]
    assert len(items) == 10
    assert items[0] == {
        "time": "09:14",
        "user": "Nora Vance",
        "action": "Asked a question",
        "target": "Program Spend",
    }


def test_overview_keeps_null_direction(client):
    body = get(client, "/overview")
    assert [k["id"] for k in body["kpis"]] == [
        "open-claims",
        "paid-month",
        "questions-week",
        "live-reports",
    ]
    # null is meaningful (no trend arrow) and must not be dropped
    assert body["kpis"][3]["up"] is None
    assert len(body["kpis"][0]["trend"]) == 8
    assert len(body["pinned"]) == 3


def test_spend_summary(client):
    body = get(client, "/spend/summary")
    assert len(body["kpis"]) == 4
    assert body["kpis"][0]["value"] == "$21.2M"
    assert [p["label"] for p in body["byGroup"]][0] == "Property damage"
    assert len(body["byGroup"]) == 6
    assert [p["label"] for p in body["byMonth"]] == [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep",
    ]


def test_spend_lines(client):
    body = get(client, "/spend/lines")
    assert body["totalRows"] == 84_312
    assert len(body["items"]) == 30
    assert body["items"][0] == {
        "claimNo": "HLG-24381",
        "account": "ARVX",
        "category": "Property damage",
        "detail": "Contractor invoice",
        "date": "Sep 26",
        "amount": 18_420.5,
    }


def test_usage(client):
    body = get(client, "/analytics/usage")
    assert [t["label"] for t in body["tiles"]][0] == "Questions asked"
    assert len(body["questionsPerWeek"]) == 8
    assert len(body["savesByTeam"]) == 5
    assert body["topReports"][0] == {"label": "Program Spend", "value": 268}


def test_scenario_list(client):
    body = get(client, "/scenarios")
    assert body["defaultId"] == "grouped"
    assert [s["id"] for s in body["items"]] == ["grouped", "trend", "refined", "guarded"]


def test_scenarios_omit_fields_their_outcome_does_not_use(client):
    by_id = {s["id"]: s for s in get(client, "/scenarios")["items"]}

    guarded = by_id["guarded"]
    assert guarded["outcome"] == "refused"
    assert guarded["refusal"]["title"] == "That field is not available here"
    assert "chart" not in guarded and "insight" not in guarded

    refined = by_id["refined"]
    assert refined["refinedQuestion"] == "Top 8 regions by total paid, this fiscal year"
    assert len(refined["chart"]["points"]) == 8
    assert "refusal" not in refined

    grouped = by_id["grouped"]
    assert grouped["steps"][0]["durationMs"] == 1100
    assert grouped["typingMs"] > 0


def test_trend_scenario_keeps_two_series(client):
    trend = get(client, "/scenarios/trend")
    assert len(trend["chart"]["seriesLabels"]) == 2
    assert all("prior" in p for p in trend["chart"]["points"])


def test_one_scenario_and_unknown_id(client):
    assert get(client, "/scenarios/guarded")["id"] == "guarded"

    res = client.get(f"{API}/scenarios/nope")
    assert res.status_code == 404
    assert res.json()["error"]["code"] == "scenario_not_found"


def test_ask_context_chart_is_built_from_clients(client):
    body = get(client, "/ask/context")
    assert len(body["suggestions"]) == 4
    chart = body["history"][0]["chart"]
    assert chart["kind"] == "bars" and chart["unit"] == "currency"
    assert [p["label"] for p in chart["points"]] == [
        "Arvex Labs", "Calder Foods", "Nimbus Health", "Orchid Systems", "Tessel Energy",
    ]
    assert chart["points"][0]["value"] == 4_612_000


def test_all_bundled_data_files_load():
    store = DataStore()
    assert len(store.clients) == 10
    assert len(store.scenarios.items) == 4


@pytest.fixture
def data_copy(tmp_path):
    for f in DATA_DIR.glob("*.json"):
        shutil.copy(f, tmp_path / f.name)
    return tmp_path


def test_malformed_data_stops_startup_with_the_file_name(data_copy):
    clients = json.loads((data_copy / "clients.json").read_text())
    clients[0]["ytdPaid"] = "not a number"
    (data_copy / "clients.json").write_text(json.dumps(clients))

    with pytest.raises(RuntimeError, match="clients.json"):
        DataStore(data_copy)


def test_inconsistent_data_is_rejected(data_copy):
    scenarios = json.loads((data_copy / "scenarios.json").read_text())
    scenarios["defaultId"] = "trend"
    scenarios["items"] = [s for s in scenarios["items"] if s["id"] != "trend"]
    (data_copy / "scenarios.json").write_text(json.dumps(scenarios))

    with pytest.raises(RuntimeError, match="defaultId"):
        DataStore(data_copy)


def test_missing_data_file_is_rejected(data_copy):
    (data_copy / "reports.json").unlink()
    with pytest.raises(RuntimeError, match="reports.json"):
        DataStore(data_copy)


def test_login_preview(client):
    body = get(client, "/login/preview")
    assert body["metric"]["value"] == "$21.2M"
    assert len(body["metric"]["trend"]) == 9
    assert body["question"] == {
        "text": "Paid by claim category this fiscal year",
        "answeredIn": "6.2s",
    }


def test_settings(client):
    body = get(client, "/settings")
    assert [r["label"] for r in body["defaults"]] == [
        "Currency",
        "Fiscal year starts",
        "Nightly refresh",
        "Saved charts visibility",
    ]
    assert [(n["id"], n["enabled"]) for n in body["notifications"]] == [
        ("refresh-digest", True),
        ("saved-chart-alerts", True),
        ("scope-refusals", False),
    ]
