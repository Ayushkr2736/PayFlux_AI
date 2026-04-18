// backend/src/services/contextService.js
const INTENT_RULES = {
  RENT: { keywords: ['rent', 'landlord', 'flat', 'apartment'], action: 'pay_rent' },
  BILL: { keywords: ['bill', 'electricity', 'water', 'utility'], action: 'pay_utility' },
  SPLIT: { keywords: ['split', 'owe', 'share', 'dinner'], action: 'settle_up' },
  RECHARGE: { keywords: ['recharge', 'prepaid', 'mobile', 'topup'], action: 'recharge_now' }
};

const AMOUNT_REGEX = /(?:Rs|INR|₹|\$|pay|paying)\s?(\d+(?:,\d+)*(?:\.\d{1,2})?)/i;

class ContextService {
  detectPaymentIntent(text) {
    const sanitizedText = text.toLowerCase();
    const amount = this.extractAmount(sanitizedText);
    const intent = this.classifyIntent(sanitizedText);
    return {
      originalText: text,
      detected: !!(intent.category || amount),
      amount: amount || null,
      intent: {
        category: intent.category || 'one_time_payment',
        confidence: intent.score,
        suggestedAction: intent.action || 'create_payment'
      },
      metadata: { isActionable: !!(intent.category && amount) }
    };
  }

  extractAmount(text) {
    const match = text.match(AMOUNT_REGEX);
    return match ? parseFloat(match[1].replace(/,/g, '')) : 0;
  }

  classifyIntent(text) {
    let top = { category: null, score: 0, action: null };
    for (const [cat, rule] of Object.entries(INTENT_RULES)) {
      let score = rule.keywords.filter(k => text.includes(k)).length;
      if (score > top.score) top = { category: cat.toLowerCase(), score, action: rule.action };
    }
    return top.score > 0 ? top : { category: null, score: 0, action: null };
  }
}

module.exports = new ContextService();
