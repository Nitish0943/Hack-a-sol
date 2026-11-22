"""Policy-faithful text cleaning component for government agricultural documents.

Preserves crucial policy semantics:
- Monetary figures (₹, Rs., Lakhs, Crores)
- Dates and fiscal periods
- Percentages
- Condition numbers and list markers (1., 2., (a), (i))
- Negations and eligibility exclusions ("not eligible", "shall not", "except", "unless")
- Hindi (Devanagari) and English Unicode characters
"""

import re
import unicodedata

# Crucial policy terms that must never be altered or stripped
ELIGIBILITY_SIGNALS = [
    "not eligible",
    "shall not",
    "except",
    "unless",
    "ineligible",
    "exclusion",
    "excluded",
    "eligibility",
    "mandatory",
    "criteria",
    "benefit",
    "subsidy",
    "condition",
    "patta",
    "khasra",
    "aadhaar",
]


class PolicyTextCleaner:
    """Cleans raw PDF text extracts while strictly maintaining legal and policy fidelity."""

    def __init__(self) -> None:
        # Regex for cleaning control characters but keeping standard whitespace
        self._control_char_re = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
        # Regex for excessive horizontal whitespace
        self._horizontal_spaces_re = re.compile(r"[^\S\r\n]+")
        # Regex for 3+ consecutive newlines -> collapse to 2 (paragraph break)
        self._excessive_newlines_re = re.compile(r"\n{3,}")
        # Trailing whitespace on lines
        self._trailing_space_re = re.compile(r"[ \t]+$", re.MULTILINE)
        # Leading whitespace on lines (except intentional indents)
        self._leading_space_re = re.compile(r"^[ \t]+", re.MULTILINE)

    def clean(self, raw_text: str) -> str:
        """Clean raw extracted text without paraphrasing or losing policy meaning."""
        if not raw_text:
            return ""

        # 1. Normalize Unicode (NFKC handles ligatures, currency symbols, and Devanagari)
        text = unicodedata.normalize("NFKC", raw_text)

        # 2. Remove non-printable control characters (e.g. form feeds, null bytes)
        text = self._control_char_re.sub("", text)

        # 3. Replace non-breaking spaces and special spaces with standard space
        text = text.replace("\u00a0", " ").replace("\u200b", "").replace("\ufeff", "")

        # 4. Standardize Indian currency representations without changing values
        # e.g., '` 6,000' or 'Rs .' or 'INR ' or font fallback '·6,000' -> standard '₹'
        text = re.sub(r"(?:`|Rs\.\s*|INR\s*|·)(?=\d)", "₹", text)

        # 5. Fix broken hyphenated words across line wraps (e.g. 'eli-\ngibility' -> 'eligibility')
        # Only when word halves are pure letters
        text = re.sub(r"([a-zA-Z]{2,})-\n([a-zA-Z]{2,})", r"\1\2", text)

        # 6. Normalize horizontal spaces within lines (collapse multiple spaces/tabs into single space)
        lines = []
        for line in text.splitlines():
            line_cleaned = self._horizontal_spaces_re.sub(" ", line).strip()
            lines.append(line_cleaned)

        cleaned_text = "\n".join(lines)

        # 7. Normalize paragraph breaks: collapse 3+ newlines to standard double newline
        cleaned_text = self._excessive_newlines_re.sub("\n\n", cleaned_text).strip()

        return cleaned_text

    @staticmethod
    def contains_eligibility_signal(text: str) -> bool:
        """Detect whether text segment contains important eligibility or exclusion clauses."""
        text_lower = text.lower()
        return any(signal in text_lower for signal in ELIGIBILITY_SIGNALS)
