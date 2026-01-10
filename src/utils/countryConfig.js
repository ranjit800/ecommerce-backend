/**
 * Multi-Country Configuration
 * Configure country-specific settings for India and USA
 */

export const COUNTRIES = {
  INDIA: 'India',
  USA: 'USA',
};

export const CURRENCIES = {
  INR: 'INR',
  USD: 'USD',
};

export const countryConfig = {
  India: {
    code: 'IN',
    currency: 'INR',
    currencySymbol: '₹',
    taxLabel: 'GST Number',
    taxFormat: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    phonePrefix: '+91',
    bankFields: {
      required: ['accountNumber', 'ifscCode', 'accountHolderName', 'bankName'],
      optional: ['branchName', 'swiftCode'],
    },
    paymentGateway: 'Razorpay',
    states: [
      'Andhra Pradesh',
      'Arunachal Pradesh',
      'Assam',
      'Bihar',
      'Chhattisgarh',
      'Goa',
      'Gujarat',
      'Haryana',
      'Himachal Pradesh',
      'Jharkhand',
      'Karnataka',
      'Kerala',
      'Madhya Pradesh',
      'Maharashtra',
      'Manipur',
      'Meghalaya',
      'Mizoram',
      'Nagaland',
      'Odisha',
      'Punjab',
      'Rajasthan',
      'Sikkim',
      'Tamil Nadu',
      'Telangana',
      'Tripura',
      'Uttar Pradesh',
      'Uttarakhand',
      'West Bengal',
      'Delhi',
    ],
  },
  USA: {
    code: 'US',
    currency: 'USD',
    currencySymbol: '$',
    taxLabel: 'Tax ID / EIN',
    taxFormat: /^[0-9]{2}-[0-9]{7}$/, // EIN format: XX-XXXXXXX
    phonePrefix: '+1',
    bankFields: {
      required: ['accountNumber', 'routingNumber', 'accountHolderName', 'bankName'],
      optional: ['swiftCode'],
    },
    paymentGateway: 'Stripe', // Or Razorpay International
    states: [
      'Alabama',
      'Alaska',
      'Arizona',
      'Arkansas',
      'California',
      'Colorado',
      'Connecticut',
      'Delaware',
      'Florida',
      'Georgia',
      'Hawaii',
      'Idaho',
      'Illinois',
      'Indiana',
      'Iowa',
      'Kansas',
      'Kentucky',
      'Louisiana',
      'Maine',
      'Maryland',
      'Massachusetts',
      'Michigan',
      'Minnesota',
      'Mississippi',
      'Missouri',
      'Montana',
      'Nebraska',
      'Nevada',
      'New Hampshire',
      'New Jersey',
      'New Mexico',
      'New York',
      'North Carolina',
      'North Dakota',
      'Ohio',
      'Oklahoma',
      'Oregon',
      'Pennsylvania',
      'Rhode Island',
      'South Carolina',
      'South Dakota',
      'Tennessee',
      'Texas',
      'Utah',
      'Vermont',
      'Virginia',
      'Washington',
      'West Virginia',
      'Wisconsin',
      'Wyoming',
    ],
  },
};

/**
 * Get country configuration
 */
export const getCountryConfig = (country) => {
  return countryConfig[country] || countryConfig.India;
};

/**
 * Validate tax number format
 */
export const validateTaxNumber = (taxNumber, country) => {
  const config = getCountryConfig(country);
  return config.taxFormat.test(taxNumber);
};

/**
 * Format currency
 */
export const formatCurrency = (amount, country) => {
  const config = getCountryConfig(country);
  return `${config.currencySymbol}${amount.toLocaleString()}`;
};

/**
 * Get required bank fields for country
 */
export const getRequiredBankFields = (country) => {
  const config = getCountryConfig(country);
  return config.bankFields.required;
};
