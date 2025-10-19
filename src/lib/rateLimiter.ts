// Enhanced rate limiter with analytics and monitoring
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface UsageStats {
  ip: string;
  totalRequests: number;
  allowedRequests: number;
  blockedRequests: number;
  lastRequest: number;
  averageRequestsPerMinute: number;
  peakRequestsPerMinute: number;
  firstRequest: number;
  userAgents: Set<string>;
}

interface RateLimitAnalytics {
  totalRequests: number;
  totalAllowed: number;
  totalBlocked: number;
  uniqueIPs: number;
  averageRequestsPerMinute: number;
  peakRequestsPerMinute: number;
  topIPs: Array<{ ip: string; requests: number; percentage: number }>;
  hourlyStats: Array<{ hour: string; requests: number; allowed: number; blocked: number }>;
  recentActivity: Array<{ ip: string; timestamp: number; allowed: boolean; userAgent?: string }>;
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    blockedPercentage: number;
    averageResponseTime: number;
  };
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private usageStats: Map<string, UsageStats> = new Map();
  private recentActivity: Array<{ ip: string; timestamp: number; allowed: boolean; userAgent?: string }> = [];
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly maxRecentActivity: number = 1000;

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isAllowed(identifier: string, userAgent?: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    // Update usage statistics
    this.updateUsageStats(identifier, now, userAgent);

    if (!entry || now > entry.resetTime) {
      // No entry or window expired, create new entry
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + this.windowMs
      };
      this.requests.set(identifier, newEntry);
      
      this.recordActivity(identifier, now, true, userAgent);
      
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: newEntry.resetTime
      };
    }

    if (entry.count >= this.maxRequests) {
      this.recordActivity(identifier, now, false, userAgent);
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      };
    }

    // Increment count
    entry.count++;
    this.requests.set(identifier, entry);
    this.recordActivity(identifier, now, true, userAgent);

    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }

  private updateUsageStats(ip: string, timestamp: number, userAgent?: string) {
    const existing = this.usageStats.get(ip);
    
    if (!existing) {
      this.usageStats.set(ip, {
        ip,
        totalRequests: 0,
        allowedRequests: 0,
        blockedRequests: 0,
        lastRequest: timestamp,
        averageRequestsPerMinute: 0,
        peakRequestsPerMinute: 0,
        firstRequest: timestamp,
        userAgents: new Set()
      });
    }

    const stats = this.usageStats.get(ip)!;
    stats.totalRequests++;
    stats.lastRequest = timestamp;
    
    if (userAgent) {
      stats.userAgents.add(userAgent);
    }
    
    // Calculate average requests per minute
    const timeDiff = timestamp - stats.firstRequest;
    if (timeDiff > 0) {
      stats.averageRequestsPerMinute = (stats.totalRequests / (timeDiff / 60000));
      
      // Update peak if current average is higher
      if (stats.averageRequestsPerMinute > stats.peakRequestsPerMinute) {
        stats.peakRequestsPerMinute = stats.averageRequestsPerMinute;
      }
    }
  }

  private recordActivity(ip: string, timestamp: number, allowed: boolean, userAgent?: string) {
    const stats = this.usageStats.get(ip);
    if (stats) {
      if (allowed) {
        stats.allowedRequests++;
      } else {
        stats.blockedRequests++;
      }
    }

    // Add to recent activity
    this.recentActivity.push({ ip, timestamp, allowed, userAgent });
    
    // Keep only recent activity (remove old entries)
    if (this.recentActivity.length > this.maxRecentActivity) {
      this.recentActivity = this.recentActivity.slice(-this.maxRecentActivity);
    }
  }

  getAnalytics(): RateLimitAnalytics {
    const now = Date.now();
    
    // Calculate totals
    let totalRequests = 0;
    let totalAllowed = 0;
    let totalBlocked = 0;
    let peakRequestsPerMinute = 0;
    
    const hourlyStats: Array<{ hour: string; requests: number; allowed: number; blocked: number }> = [];
    
    // Initialize hourly buckets for the last 24 hours
    for (let i = 23; i >= 0; i--) {
      const hourStart = now - (i * 60 * 60 * 1000);
      const hourLabel = new Date(hourStart).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      
      hourlyStats.push({
        hour: hourLabel,
        requests: 0,
        allowed: 0,
        blocked: 0
      });
    }
    
    // Process usage stats
    this.usageStats.forEach((stats) => {
      totalRequests += stats.totalRequests;
      totalAllowed += stats.allowedRequests;
      totalBlocked += stats.blockedRequests;
      
      if (stats.peakRequestsPerMinute > peakRequestsPerMinute) {
        peakRequestsPerMinute = stats.peakRequestsPerMinute;
      }
    });
    
    // Process recent activity for hourly stats
    this.recentActivity.forEach((activity) => {
      const activityHour = new Date(activity.timestamp).getHours();
      const currentHour = new Date(now).getHours();
      const hourIndex = (currentHour - activityHour + 24) % 24;
      
      if (hourIndex < hourlyStats.length) {
        hourlyStats[hourIndex].requests++;
        if (activity.allowed) {
          hourlyStats[hourIndex].allowed++;
        } else {
          hourlyStats[hourIndex].blocked++;
        }
      }
    });
    
    // Get top IPs
    const topIPs = Array.from(this.usageStats.values())
      .sort((a, b) => b.totalRequests - a.totalRequests)
      .slice(0, 10)
      .map(stats => ({
        ip: stats.ip,
        requests: stats.totalRequests,
        percentage: totalRequests > 0 ? (stats.totalRequests / totalRequests) * 100 : 0
      }));
    
    // Get recent activity (last 50 entries)
    const recentActivity = this.recentActivity
      .slice(-50)
      .map(activity => ({
        ...activity,
        timestamp: activity.timestamp
      }))
      .reverse();
    
    const averageRequestsPerMinute = totalRequests > 0 
      ? totalRequests / ((now - Math.min(...Array.from(this.usageStats.values()).map(s => s.firstRequest))) / 60000)
      : 0;
    
    // Calculate system health
    const blockedPercentage = totalRequests > 0 ? (totalBlocked / totalRequests) * 100 : 0;
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    if (blockedPercentage > 20) {
      status = 'critical';
    } else if (blockedPercentage > 10) {
      status = 'warning';
    }
    
    return {
      totalRequests,
      totalAllowed,
      totalBlocked,
      uniqueIPs: this.usageStats.size,
      averageRequestsPerMinute: Math.round(averageRequestsPerMinute * 100) / 100,
      peakRequestsPerMinute: Math.round(peakRequestsPerMinute * 100) / 100,
      topIPs,
      hourlyStats,
      recentActivity,
      systemHealth: {
        status,
        blockedPercentage: Math.round(blockedPercentage * 100) / 100,
        averageResponseTime: 0 // This would be calculated from actual response times
      }
    };
  }

  getIPStats(ip: string): UsageStats | null {
    return this.usageStats.get(ip) || null;
  }

  resetStats() {
    this.usageStats.clear();
    this.recentActivity = [];
  }

  // Clean up expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

// Create rate limiter instance: 10 requests per minute per IP
export const rateLimiter = new RateLimiter(60000, 10);

// Clean up expired entries every 5 minutes
setInterval(() => {
  rateLimiter.cleanup();
}, 5 * 60 * 1000);
