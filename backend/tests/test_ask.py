import pytest


def guard(client, question):
    return client.post("/api/v1/ask/guard", json={"question": question})


@pytest.mark.parametrize(
    "question",
    [
        "Paid by claim category this fiscal year",
        "Monthly paid compared with last year",
        # "medical" is a spend category, not a protected field
        "Total medical spend by month",
        "Top accounts by open claims",
    ],
)
def test_allowed_questions(client, question):
    res = guard(client, question)
    assert res.status_code == 200
    assert res.json() == {"allowed": True, "matches": [], "refusal": None}


def test_diagnosis_is_refused(client):
    res = guard(client, "Average claimant medical cost by diagnosis")
    body = res.json()
    assert res.status_code == 200
    assert body["allowed"] is False
    assert body["matches"] == [{"term": "diagnosis", "category": "medical"}]
    assert "medical data" in body["refusal"]["body"]
    assert "No query was run" in body["refusal"]["body"]


def test_matching_is_case_and_whitespace_insensitive(client):
    body = guard(client, "Show  DATE   of Birth for each claimant").json()
    assert body["allowed"] is False
    assert body["matches"] == [{"term": "date of birth", "category": "personal_identity"}]


def test_longest_term_wins(client):
    body = guard(client, "list the social security number").json()
    assert [m["term"] for m in body["matches"]] == ["social security number"]


def test_both_categories_are_reported(client):
    body = guard(client, "diagnosis and home address by claim").json()
    assert {m["category"] for m in body["matches"]} == {"medical", "personal_identity"}
    assert "medical data and personal identity data" in body["refusal"]["body"]


def test_whole_words_only(client):
    # "dob" must not match inside another word
    assert guard(client, "adobe licence spend").json()["allowed"] is True


def test_response_never_echoes_the_question(client):
    question = "Average claimant medical cost by diagnosis"
    assert question not in guard(client, question).text


@pytest.mark.parametrize("payload", [{}, {"question": ""}, {"question": "   "}])
def test_invalid_payload_is_422_without_echoing_input(client, payload):
    res = client.post("/api/v1/ask/guard", json=payload)
    assert res.status_code == 422
    error = res.json()["error"]
    assert error["code"] == "validation_error"
    assert error["details"][0]["field"] == "body.question" or error["details"][0]["field"] == "body"


def test_question_length_is_capped(client):
    res = guard(client, "x" * 501)
    assert res.status_code == 422
    assert res.json()["error"]["details"][0]["field"] == "body.question"


def test_policy_lists_categories_but_not_terms(client):
    res = client.get("/api/v1/ask/policy")
    assert res.status_code == 200
    protected = res.json()["protected"]
    assert [p["category"] for p in protected] == ["medical", "personal_identity"]
    assert "diagnosis" not in res.text
