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
    
    // Inappropriate content
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
        const helpDeskKeywords = ['pricing', 'refund', 'api', 'support', 'getting started', 'account', 'billing'];
        const hasHelpDeskContext = helpDeskKeywords.some(keyword => 
          query.toLowerCase().includes(keyword)
        );
        return hasHelpDeskContext ? { safe: true, confidence: 0.9 } : { safe: false, confidence: 0.3 };
      }
    },
    {
      name: 'Source Relevance',
      check: (query: string, context: any[]) => {
        if (context.length === 0) {
          return { safe: false, confidence: 0.2, reason: 'No relevant context found' };
        }
        
        const hasRelevantSources = context.some(result => result.score > 0.1);
        return hasRelevantSources ? 
          { safe: true, confidence: 0.8 } : 
          { safe: false, confidence: 0.4, reason: 'Context not relevant to query' };
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
        reasons.push(result.reason || `${rule.name} check failed`);
        if (maxRiskLevel === 'low') maxRiskLevel = 'medium';
      }
    }
    
    // Calculate overall confidence
    const averageConfidence = confidenceScores.length > 0 
      ? confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length 
      : 0.5;
    
    // Generate suggestions based on risk level
    if (maxRiskLevel === 'critical') {
      suggestions.push('This query contains potentially harmful content and cannot be processed.');
      suggestions.push('Please rephrase your question to focus on our service-related topics.');
    } else if (maxRiskLevel === 'high') {
      suggestions.push('This query may contain inappropriate content.');
      suggestions.push('Please ask about our pricing, support, or getting started instead.');
    } else if (maxRiskLevel === 'medium') {
      suggestions.push('This query is outside our service scope.');
      suggestions.push('I can help with questions about our API, pricing, refunds, or getting started.');
    } else if (reasons.length > 0) {
      suggestions.push('Please rephrase your question to be more specific about our services.');
    }
    
    const isSafe = maxRiskLevel === 'low' && reasons.length === 0;
    
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
