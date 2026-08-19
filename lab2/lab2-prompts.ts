// Edge cases:
// expect(validateCreditCardNumber('4111 1111 1111 1111')).toBe(true);
// expect(validateCreditCardNumber('4111-1111-1111-1111')).toBe(true);
// expect(validateCreditCardNumber('4111 1111 1111 1112')).toBe(false);
// expect(validateCreditCardNumber('')).toBe(false);
// expect(validateCreditCardNumber('4111-1111-1111-111a')).toBe(false);
function validateCreditCardNumber(cardNumber: string): boolean {
    const normalizedCardNumber = cardNumber.replace(/[ -]/g, '');

    if (!/^\d{2,}$/.test(normalizedCardNumber)) {
        return false;
    }

    let sum = 0;
    let shouldDouble = false;

    for (let index = normalizedCardNumber.length - 1; index >= 0; index--) {
        let digit = Number(normalizedCardNumber[index]);

        if (shouldDouble) {
            digit *= 2;

            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
        shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
}

/**
 * Validates a credit card number using the Luhn algorithm.
 * @param digits - A string containing only the card's digits (no spaces or separators).
 * @returns True if the string is 13-19 digits long and passes the Luhn checksum.
 */
function validateCreditCard(digits: string): boolean {
    if (!/^\d{13,19}$/.test(digits)) {
        return false;
    }

    let sum = 0;
    let shouldDouble = false;

    for (let index = digits.length - 1; index >= 0; index--) {
        let digit = Number(digits[index]);

        if (shouldDouble) {
            digit *= 2;

            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
        shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
}

//Date format co,version: US ->ISO
// "01/15/2025" -> "2025-01-15"
// "12/31/2024" -> "2024-12-31"
// "03/07/2026" -> "2026-03-07"
//
// Now convert: "06/19/2026" -> "2026-06-19"

// Convert US date (MM/DD/YYYY) to ISO format (YYYY-MM-DD)
// Examples:
// convertDate("01/15/2025") → "2025-01-15"
// convertDate("12/31/2024") → "2024-12-31"
function convertDate(usDate: string): string {
    const [month, day, year] = usDate.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}