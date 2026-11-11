from typing import Literal

from app.schemas.common import CamelModel


class Persona(CamelModel):
    """The signed-in user and the workspace they belong to."""

    name: str
    role: str
    email: str
    company: str


class Client(CamelModel):
    code: str
    name: str
    industry: str
    regions: int
    open_claims: int
    ytd_paid: int


class Claim(CamelModel):
    claim_no: str
    claimant: str
    account: str
    incident: str
    coverage: str
    status: Literal["Open", "Review", "Settled"]
    paid: int


class Report(CamelModel):
    key: str
    name: str
    domain: Literal["Finance", "Operations", "Partners"]
    owner: str
    last_opened: str
    live: bool


class ActivityEntry(CamelModel):
    time: str
    user: str
    action: str
    target: str


class Kpi(CamelModel):
    id: Literal["open-claims", "paid-month", "questions-week", "live-reports"]
    label: str
    value: str
    delta: str
    # True and False mark a rising or falling figure; None means "no direction".
    up: bool | None
    trend: list[float]


class PinnedReport(CamelModel):
    name: str
    blurb: str
    href: str


class Overview(CamelModel):
    kpis: list[Kpi]
    pinned: list[PinnedReport]


class PreviewMetric(CamelModel):
    label: str
    value: str
    trend: list[float]


class PreviewQuestion(CamelModel):
    text: str
    answered_in: str


class LoginPreview(CamelModel):
    """The figures in the product preview beside the sign in form."""

    metric: PreviewMetric
    question: PreviewQuestion


class SettingRow(CamelModel):
    label: str
    value: str


class NotificationSetting(CamelModel):
    id: str
    label: str
    sub: str
    enabled: bool


class WorkspaceSettings(CamelModel):
    """Workspace defaults and notification preferences. Profile comes from Persona."""

    defaults: list[SettingRow]
    notifications: list[NotificationSetting]
