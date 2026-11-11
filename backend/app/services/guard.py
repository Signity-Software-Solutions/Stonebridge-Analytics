"""Access check for natural language questions.

Reports exclude medical and personal identity fields for every role. The
frontend can script that refusal, but only the server can enforce it, so this
service is the authority. It matches whole words against a fixed policy and
never stores or logs the question text.
"""

import re
from dataclasses import dataclass

from app.schemas.ask import (
    GuardMatch,
    GuardResponse,
    PolicyCategory,
    PolicyResponse,
    Refusal,
)


@dataclass(frozen=True)
class ProtectedCategory:
    category: str
    label: str
    description: str
    terms: tuple[str, ...]


PROTECTED_CATEGORIES: tuple[ProtectedCategory, ...] = (
    ProtectedCategory(
        category="medical",
        label="Medical data",
        description="Diagnoses, prescriptions and clinical records.",
        terms=(
            "diagnosis",
            "diagnoses",
            "icd code",
            "icd codes",
            "icd-10",
            "prognosis",
            "prescription",
            "prescriptions",
            "medication",
            "medications",
            "medical record",
            "medical records",
            "medical history",
        ),
    ),
    ProtectedCategory(
        category="personal_identity",
        label="Personal identity data",
        description="Government ids, birth dates and contact details of individuals.",
        terms=(
            "ssn",
            "social security number",
            "social security",
            "date of birth",
            "birth date",
            "dob",
            "home address",
            "phone number",
            "passport",
            "driver license",
            "driver licence",
            "drivers license",
        ),
    ),
)


def _compile(terms: tuple[str, ...]) -> re.Pattern[str]:
    # Longest first so "social security number" wins over "social security".
    ordered = sorted(terms, key=len, reverse=True)
    alternation = "|".join(re.escape(t).replace(r"\ ", r"\s+") for t in ordered)
    return re.compile(rf"\b(?:{alternation})\b", re.IGNORECASE)


class GuardService:
    def __init__(
        self, categories: tuple[ProtectedCategory, ...] = PROTECTED_CATEGORIES
    ) -> None:
        self._categories = categories
        self._patterns = [(c, _compile(c.terms)) for c in categories]

    def check(self, question: str) -> GuardResponse:
        matches: list[GuardMatch] = []
        seen: set[tuple[str, str]] = set()
        hit_labels: list[str] = []

        for category, pattern in self._patterns:
            for found in pattern.finditer(question):
                term = " ".join(found.group(0).lower().split())
                key = (category.category, term)
                if key not in seen:
                    seen.add(key)
                    matches.append(GuardMatch(term=term, category=category.category))
            if any(m.category == category.category for m in matches):
                hit_labels.append(category.label.lower())

        if not matches:
            return GuardResponse(allowed=True, matches=[])

        return GuardResponse(
            allowed=False,
            matches=matches,
            refusal=Refusal(
                title="That field is not available",
                body=(
                    f"This question refers to {' and '.join(hit_labels)}, which is "
                    "excluded from reporting for every role. No query was run."
                ),
            ),
        )

    def policy(self) -> PolicyResponse:
        return PolicyResponse(
            protected=[
                PolicyCategory(
                    category=c.category, label=c.label, description=c.description
                )
                for c in self._categories
            ]
        )
