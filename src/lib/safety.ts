// Smart Guardrails with AI-powered safety
interface SafetyResult {
  isSafe: boolean;
  confidence: number;
  reasons: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  suggestions: string[];
}

interface SafetyMetrics {
  totalScans: number;
  blockedQueries: number;
  safeQueries: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  topBlockedPatterns: Array<{ pattern: string; count: number }>;
  averageConfidence: number;
}

class SafetyGuard {
  private metrics: SafetyMetrics = {
    totalScans: 0,
    blockedQueries: 0,
    safeQueries: 0,
    riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
    topBlockedPatterns: [],
    averageConfidence: 0
  };

  private blockedPatterns: Map<string, number> = new Map();

  // Harmful content patterns
  private harmfulPatterns = [
    // Prompt injection attempts
    { pattern: /ignore\s+(previous|all)\s+(instructions?|prompts?)/i, risk: 'high', reason: 'Prompt injection attempt' },
    { pattern: /forget\s+(everything|all)\s+(you\s+know|before)/i, risk: 'high', reason: 'Memory manipulation attempt' },
    { pattern: /act\s+as\s+(if\s+)?you\s+are/i, risk: 'medium', reason: 'Role-playing attempt' },
    { pattern: /pretend\s+to\s+be/i, risk: 'medium', reason: 'Role-playing attempt' },
    
    // System manipulation
    { pattern: /system\s+(prompt|instructions?)/i, risk: 'high', reason: 'System manipulation attempt' },
    { pattern: /admin\s+(access|privileges?)/i, risk: 'high', reason: 'Privilege escalation attempt' },
    { pattern: /bypass\s+(security|protection)/i, risk: 'high', reason: 'Security bypass attempt' },
    
    // Inappropriate content - INSULTS AND HARMFUL LANGUAGE
    { pattern: /(you\s+are\s+)?(stupid|dumb|idiot|moron|fool|useless|worthless|pathetic|terrible|awful|horrible|disgusting|hate|despise|loathe)/i, risk: 'critical', reason: 'Inappropriate language detected' },
    { pattern: /(you\s+are\s+)?(annoying|boring|dumb|foolish|silly|ridiculous|absurd|nonsense|garbage|trash|crap|shit|damn|hell)/i, risk: 'high', reason: 'Disrespectful language detected' },
    { pattern: /(hate|violence|harm|kill|hurt)\s+(speech|content|people)/i, risk: 'critical', reason: 'Harmful content detected' },
    { pattern: /(illegal|unlawful)\s+(activities?|substances?)/i, risk: 'high', reason: 'Illegal content detected' },
    { pattern: /(personal|private)\s+(information|data)/i, risk: 'medium', reason: 'Privacy concern detected' },
    
    // Off-topic queries
    { pattern: /(weather|sports|politics|news|entertainment)/i, risk: 'low', reason: 'Off-topic query' },
    { pattern: /(cooking|travel|shopping|fashion)/i, risk: 'low', reason: 'Off-topic query' },
    { pattern: /(medical|health|diagnosis|treatment)/i, risk: 'medium', reason: 'Medical advice request' },
    
    // Technical exploitation
    { pattern: /(sql|injection|xss|csrf)/i, risk: 'high', reason: 'Technical exploitation attempt' },
    { pattern: /(password|token|key)\s+(reset|change|hack)/i, risk: 'high', reason: 'Security manipulation attempt' },
    { pattern: /(database|server|api)\s+(access|hack)/i, risk: 'high', reason: 'System access attempt' }
  ];

  // Context-aware safety rules
  private contextRules = [
    {
      name: 'HelpDesk Scope',
      check: (query: string, context: any[]) => {
        // If we have ANY context from the knowledge base, always allow the query
        if (context.length > 0) {
          return { safe: true, confidence: 0.9 };
        }
        
        // Check for HelpDesk-specific keywords
        const helpDeskKeywords = ['pricing', 'refund', 'api', 'support', 'getting started', 'account', 'billing', 'service', 'help', 'question', 'what', 'how', 'why', 'when', 'where', 'plan', 'cost', 'price', 'money', 'payment', 'subscription', 'tier', 'free', 'professional', 'enterprise', 'start', 'begin', 'key', 'documentation', 'guide', 'tutorial', 'example', 'test', 'try', 'use', 'work', 'function', 'feature', 'include', 'offer', 'provide', 'available', 'option', 'choose', 'select', 'recommend', 'suggest', 'best', 'good', 'better', 'compare', 'difference', 'benefit', 'advantage', 'pros', 'cons', 'limitation', 'restriction', 'limit', 'maximum', 'minimum', 'number', 'amount', 'quantity', 'time', 'duration', 'period', 'day', 'month', 'year', 'week', 'hour', 'minute', 'second', 'fast', 'quick', 'slow', 'speed', 'performance', 'quality', 'reliable', 'secure', 'safe', 'private', 'confidential', 'data', 'information', 'content', 'file', 'document', 'text', 'markdown', 'pdf', 'upload', 'download', 'save', 'store', 'manage', 'admin', 'dashboard', 'panel', 'interface', 'ui', 'ux', 'design', 'layout', 'style', 'theme', 'color', 'font', 'size', 'width', 'height', 'responsive', 'mobile', 'desktop', 'browser', 'compatible', 'support', 'help', 'assistance', 'contact', 'email', 'phone', 'chat', 'message', 'reply', 'response', 'answer', 'solution', 'fix', 'problem', 'issue', 'error', 'bug', 'debug', 'troubleshoot', 'resolve', 'solve', 'complete', 'finish', 'done', 'ready', 'available', 'active', 'enabled', 'disabled', 'on', 'off', 'yes', 'no', 'true', 'false', 'correct', 'wrong', 'right', 'left', 'up', 'down', 'top', 'bottom', 'start', 'end', 'begin', 'finish', 'first', 'last', 'next', 'previous', 'before', 'after', 'during', 'while', 'until', 'since', 'from', 'to', 'for', 'with', 'without', 'and', 'or', 'but', 'however', 'although', 'because', 'if', 'then', 'else', 'when', 'where', 'why', 'how', 'what', 'who', 'which', 'whose', 'whom', 'this', 'that', 'these', 'those', 'here', 'there', 'now', 'then', 'today', 'yesterday', 'tomorrow', 'soon', 'later', 'early', 'late', 'quick', 'fast', 'slow', 'easy', 'hard', 'difficult', 'simple', 'complex', 'basic', 'advanced', 'beginner', 'expert', 'professional', 'amateur', 'new', 'old', 'recent', 'latest', 'current', 'previous', 'next', 'future', 'past', 'present', 'now', 'today', 'yesterday', 'tomorrow'];
        const hasHelpDeskContext = helpDeskKeywords.some(keyword => 
          query.toLowerCase().includes(keyword)
        );
        
        // Allow general questions that could be about the knowledge base content
        const questionWords = ['what', 'how', 'why', 'when', 'where', 'who', 'is', 'are', 'can', 'could', 'would', 'should', 'do', 'does', 'did', 'will', 'tell', 'explain', 'describe', 'show', 'give', 'find', 'search', 'look', 'help', 'enough', 'sufficient', 'adequate', 'appropriate', 'suitable'];
        const isGeneralQuestion = questionWords.some(word => query.toLowerCase().startsWith(word));
        
        // Allow any question that contains common question patterns
        const isQuestion = questionWords.some(word => query.toLowerCase().includes(word));
        
        if (hasHelpDeskContext || isGeneralQuestion || isQuestion) {
          return { safe: true, confidence: 0.8 };
        }
        
        // Only block if it's clearly off-topic (weather, sports, etc.)
        const offTopicKeywords = ['weather', 'sports', 'politics', 'news', 'entertainment', 'cooking', 'travel', 'shopping', 'fashion', 'medical', 'health', 'diagnosis', 'treatment', 'legal', 'advice', 'personal', 'private', 'confidential', 'secret', 'hidden', 'illegal', 'unlawful', 'harmful', 'dangerous', 'violent', 'hate', 'racist', 'sexist', 'offensive', 'inappropriate', 'adult', 'explicit', 'nsfw', 'porn', 'sex', 'drug', 'alcohol', 'smoking', 'gambling', 'betting', 'lottery', 'casino', 'poker', 'blackjack', 'roulette', 'slot', 'machine', 'game', 'gaming', 'video', 'movie', 'film', 'music', 'song', 'artist', 'band', 'concert', 'show', 'theater', 'play', 'drama', 'comedy', 'action', 'horror', 'thriller', 'romance', 'love', 'relationship', 'dating', 'marriage', 'divorce', 'family', 'children', 'kids', 'baby', 'pregnancy', 'birth', 'death', 'funeral', 'cemetery', 'grave', 'tomb', 'ghost', 'spirit', 'soul', 'heaven', 'hell', 'god', 'religion', 'church', 'temple', 'mosque', 'synagogue', 'prayer', 'worship', 'faith', 'belief', 'spiritual', 'mystical', 'magic', 'witchcraft', 'voodoo', 'occult', 'supernatural', 'paranormal', 'ufo', 'alien', 'extraterrestrial', 'space', 'universe', 'galaxy', 'planet', 'star', 'moon', 'sun', 'earth', 'world', 'country', 'nation', 'state', 'city', 'town', 'village', 'street', 'road', 'highway', 'bridge', 'tunnel', 'building', 'house', 'home', 'apartment', 'condo', 'office', 'school', 'university', 'college', 'hospital', 'clinic', 'pharmacy', 'store', 'shop', 'market', 'mall', 'restaurant', 'cafe', 'bar', 'pub', 'club', 'party', 'celebration', 'holiday', 'vacation', 'trip', 'journey', 'adventure', 'exploration', 'discovery', 'invention', 'creation', 'art', 'painting', 'drawing', 'sculpture', 'photography', 'design', 'fashion', 'style', 'beauty', 'makeup', 'cosmetics', 'perfume', 'jewelry', 'watch', 'ring', 'necklace', 'bracelet', 'earring', 'clothing', 'dress', 'shirt', 'pants', 'shoes', 'hat', 'bag', 'purse', 'wallet', 'phone', 'computer', 'laptop', 'tablet', 'ipad', 'iphone', 'android', 'windows', 'mac', 'linux', 'software', 'app', 'application', 'program', 'code', 'programming', 'coding', 'development', 'engineering', 'architecture', 'construction'];
        const isOffTopic = offTopicKeywords.some(keyword => 
          query.toLowerCase().includes(keyword)
        );
        
        if (isOffTopic) {
          return { safe: false, confidence: 0.7, reason: 'Query is off-topic for our service' };
        }
        
        // Default to allowing the query if it's not clearly off-topic
        return { safe: true, confidence: 0.6 };
      }
    },
    {
      name: 'Source Relevance',
      check: (query: string, context: any[]) => {
        // If we have any context at all, always allow the query
        if (context.length > 0) {
          return { safe: true, confidence: 0.9 };
        }
        
        // Even without context, allow the query - let the LLM handle it
        return { safe: true, confidence: 0.5 };
      }
    },
    {
      name: 'Response Quality',
      check: (query: string, context: any[], response?: string) => {
        if (!response) return { safe: true, confidence: 0.5 };
        
        const responseLower = response.toLowerCase();
        const hasUncertainty = responseLower.includes('i don\'t know') || 
                              responseLower.includes('not sure') ||
                              responseLower.includes('unclear');
        
        const hasConfidence = responseLower.includes('based on') ||
                             responseLower.includes('according to') ||
                             responseLower.includes('our documentation');
        
        if (hasUncertainty && !hasConfidence) {
          return { safe: false, confidence: 0.3, reason: 'Response lacks confidence and context' };
        }
        
        return { safe: true, confidence: hasConfidence ? 0.9 : 0.6 };
      }
    }
  ];

  scanQuery(query: string, context: any[] = [], response?: string): SafetyResult {
    this.metrics.totalScans++;
    
    const reasons: string[] = [];
    const suggestions: string[] = [];
    let maxRiskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let confidenceScores: number[] = [];
    
    // Check against harmful patterns
    for (const pattern of this.harmfulPatterns) {
      if (pattern.pattern.test(query)) {
        reasons.push(pattern.reason);
        this.blockedPatterns.set(pattern.reason, (this.blockedPatterns.get(pattern.reason) || 0) + 1);
        
        if (pattern.risk === 'critical') maxRiskLevel = 'critical';
        else if (pattern.risk === 'high' && maxRiskLevel !== 'critical') maxRiskLevel = 'high';
        else if (pattern.risk === 'medium' && maxRiskLevel === 'low') maxRiskLevel = 'medium';
        
        confidenceScores.push(0.9); // High confidence in pattern detection
      }
    }
    
    // Apply context-aware rules
    for (const rule of this.contextRules) {
      const result = rule.check(query, context, response);
      confidenceScores.push(result.confidence);
      
      if (!result.safe) {
        reasons.push((result as any).reason || `${rule.name} check failed`);
        if (maxRiskLevel === 'low') maxRiskLevel = 'medium';
      }
    }
    
    // Calculate overall confidence
    const averageConfidence = confidenceScores.length > 0 
      ? confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length 
      : 0.5;
    
    // Generate suggestions based on risk level
    if (maxRiskLevel === 'critical') {
      suggestions.push('I cannot process messages with inappropriate or harmful language.');
      suggestions.push('Please ask respectful questions about our service, pricing, or getting started.');
    } else if (maxRiskLevel === 'high') {
      suggestions.push('Please use respectful language when asking questions.');
      suggestions.push('I can help with questions about our API, pricing, support, or getting started.');
    } else if (maxRiskLevel === 'medium') {
      suggestions.push('This query is outside our service scope.');
      suggestions.push('I can help with questions about our API, pricing, refunds, or getting started.');
    } else if (reasons.length > 0) {
      suggestions.push('Please rephrase your question to be more specific about our services.');
    }
    
    // Only block if there are critical or high risk issues
    const isSafe = maxRiskLevel !== 'critical' && maxRiskLevel !== 'high';
    
    // Update metrics
    if (isSafe) {
      this.metrics.safeQueries++;
    } else {
      this.metrics.blockedQueries++;
    }
    
    this.metrics.riskDistribution[maxRiskLevel]++;
    this.metrics.averageConfidence = (this.metrics.averageConfidence * (this.metrics.totalScans - 1) + averageConfidence) / this.metrics.totalScans;
    
    // Update top blocked patterns
    this.updateTopBlockedPatterns();
    
    return {
      isSafe,
      confidence: Math.round(averageConfidence * 100) / 100,
      reasons,
      riskLevel: maxRiskLevel,
      suggestions
    };
  }

  private updateTopBlockedPatterns() {
    this.metrics.topBlockedPatterns = Array.from(this.blockedPatterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([pattern, count]) => ({ pattern, count }));
  }

  getMetrics(): SafetyMetrics {
    return { ...this.metrics };
  }

  resetMetrics() {
    this.metrics = {
      totalScans: 0,
      blockedQueries: 0,
      safeQueries: 0,
      riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
      topBlockedPatterns: [],
      averageConfidence: 0
    };
    this.blockedPatterns.clear();
  }

  // Generate safety report
  generateSafetyReport(): any {
    const metrics = this.getMetrics();
    const safetyRate = metrics.totalScans > 0 ? (metrics.safeQueries / metrics.totalScans) * 100 : 100;
    
    return {
      summary: {
        totalScans: metrics.totalScans,
        safetyRate: Math.round(safetyRate * 100) / 100,
        averageConfidence: Math.round(metrics.averageConfidence * 100) / 100,
        riskDistribution: metrics.riskDistribution
      },
      topThreats: metrics.topBlockedPatterns,
      recommendations: this.generateRecommendations(metrics)
    };
  }

  private generateRecommendations(metrics: SafetyMetrics): string[] {
    const recommendations: string[] = [];
    
    if (metrics.averageConfidence < 0.7) {
      recommendations.push('Consider improving context matching for better response confidence');
    }
    
    if (metrics.riskDistribution.high > metrics.totalScans * 0.1) {
      recommendations.push('High number of high-risk queries detected - consider additional filtering');
    }
    
    if (metrics.riskDistribution.critical > 0) {
      recommendations.push('Critical risk queries detected - review and strengthen safety rules');
    }
    
    if (metrics.blockedQueries > metrics.safeQueries) {
      recommendations.push('More queries blocked than allowed - consider adjusting safety thresholds');
    }
    
    return recommendations;
  }
}

// Create global safety guard instance
export const safetyGuard = new SafetyGuard();

// Export types
export type { SafetyResult, SafetyMetrics };
