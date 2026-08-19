
/** Represents a user account. */
export interface User {
    /** Unique identifier for the user. */
    id: string;
    /** User's display name. */
    name: string;
    /** User's email address. */
    email: string;
    /** Date and time when the user account was created. */
    createdAt: Date;
    /** Optional URL of the user's avatar image. */
    avatarUrl?: string;
}

async function calculateTax(income: number, rate: number): Promise<number> {
    if (income < 0 || rate < 0) {
        throw new RangeError('Income and rate must be non-negative.');
    }

    return income * rate;
}

// Validate an email address using regex
// Unit test cases:
// expect(validateEmail('user@example.com')).toBe(true);
// expect(validateEmail('first.last+tag@example.co.uk')).toBe(true);
// expect(validateEmail('user@')).toBe(false);
// expect(validateEmail('not-an-email')).toBe(false);
function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function parseCSVRow(line: string, delimiter: string = ','): string[] {
    return line.split(delimiter);
}

function fahrenheitToCelsius(fahrenheit: number): number {
    return (fahrenheit - 32) * 5 / 9;
}

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

