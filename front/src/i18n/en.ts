export const en = {
  // Bill view
  subtotal: "Subtotal",
  total: "Total",
  yourShare: "Your share",
  youPay: "You pay",
  tip: "Tip",
  noTip: "No tip",
  splitTheBill: "Split the bill",
  payFullBill: "Pay full bill",
  backToBill: "Back to bill",
  backToTip: "Back to tip",
  pay: "Pay",
  item: "item",
  items: "items",

  // Split
  splitEqually: "Split equally",
  splitByItem: "Split by item",
  customAmounts: "Custom amounts",
  divideEvenly: "Divide evenly between everyone",
  eachPersonPicks: "Each person picks what they had",
  enterHowMuch: "Enter how much each person pays",
  howManyPeople: "How many people are splitting?",
  people: "people",
  changeSplitMethod: "Change split method",
  payYourShare: "Pay your share",
  lastPersonPays: "Last person pays",
  toCoverRounding: "to cover rounding",
  of: "of",

  // Tip
  addATip: "Add a tip",
  tipCalculatedOnSubtotal: "Your tip is calculated on the subtotal",
  custom: "Custom",
  customTip: "Custom tip",
  tipAmount: "Tip amount",
  done: "Done",

  // Payment
  totalToPay: "Total to pay",
  orPayWithCard: "or pay with card",
  creditOrDebitCard: "Credit or debit card",
  cardDetails: "Card details",
  cardNumber: "Card number",
  expiry: "Expiry",
  cvc: "CVC",
  enterValidCard: "Enter a valid card number",

  // Payment states
  paymentFailed: "Payment failed",
  somethingWentWrong: "Something went wrong. Please try again.",
  tryAgain: "Try again",
  useDifferentMethod: "Use a different payment method",

  // Confirmation
  paymentSuccessful: "Payment successful",
  paidVia: "Paid via",
  paymentSummary: "Payment summary",
  totalPaid: "Total paid",
  emailReceipt: "Email receipt",
  receiptSentTo: "Receipt sent to",
  send: "Send",
  pleaseEnterEmail: "Please enter your email",
  pleaseEnterValidEmail: "Please enter a valid email",
  enjoyedExperience: "Enjoyed your experience at",
  leaveGoogleReview: "Leave a Google review",

  // Session
  billAlreadySettled: "Bill already settled",
  billAlreadyPaid:
    "This bill has already been paid. If you believe this is an error, please ask your server for assistance.",
  sessionTimedOut: "Session timed out",
  sessionInactive:
    "Your session has been inactive for too long. Please refresh to load the latest bill.",
  refreshBill: "Refresh bill",

  // Table
  table: "Table",

  // Language
  language: "Language",
  english: "English",
  azerbaijani: "Azərbaycanca",
} as const;

export type TranslationKey = keyof typeof en;
