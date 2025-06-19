import { Candidate, Evaluation, SimilarCandidate } from '../types';
import { getCandidates, getEvaluations } from './storage';

export class SimilarCandidateAnalyzer {
  // 類似候補者を検索する
  public findSimilarCandidates(candidate: Candidate, limit: number = 5): SimilarCandidate[] {
    const allCandidates = getCandidates();
    const allEvaluations = getEvaluations();
    
    // 現在の候補者を除外
    const pastCandidates = allCandidates.filter(c => c.id !== candidate.id);
    
    // 評価が完了している候補者のみを対象とする
    const evaluatedCandidates = pastCandidates.filter(c => {
      const evaluation = allEvaluations.find(e => e.candidateId === c.id);
      return evaluation && evaluation.isComplete && evaluation.finalDecision;
    });
    
    if (evaluatedCandidates.length === 0) {
      return [];
    }
    
    // 類似度を計算
    const similarCandidates = evaluatedCandidates.map(c => {
      const evaluation = allEvaluations.find(e => e.candidateId === c.id);
      const similarity = this.calculateSimilarity(candidate, c);
      
      return {
        candidate: c,
        evaluation: evaluation!,
        similarityScore: similarity,
        similarityReasons: this.getSimilarityReasons(candidate, c)
      };
    });
    
    // 類似度でソートして上位を返す
    return similarCandidates
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);
  }
  
  // 類似度を計算する
  private calculateSimilarity(candidate1: Candidate, candidate2: Candidate): number {
    let score = 0;
    let totalWeight = 0;
    
    // 職種の一致 (最も重要)
    if (candidate1.appliedPosition === candidate2.appliedPosition) {
      score += 40;
    }
    totalWeight += 40;
    
    // 学歴の類似性
    const educationSimilarity = this.calculateTextSimilarity(
      candidate1.education, 
      candidate2.education
    );
    score += educationSimilarity * 10;
    totalWeight += 10;
    
    // 専攻の類似性
    if (candidate1.major && candidate2.major) {
      const majorSimilarity = this.calculateTextSimilarity(
        candidate1.major, 
        candidate2.major
      );
      score += majorSimilarity * 10;
      totalWeight += 10;
    }
    
    // 経験の類似性
    const experienceSimilarity = this.calculateTextSimilarity(
      candidate1.experience, 
      candidate2.experience
    );
    score += experienceSimilarity * 20;
    totalWeight += 20;
    
    // 自己PRの類似性
    const selfPrSimilarity = this.calculateTextSimilarity(
      candidate1.selfPr, 
      candidate2.selfPr
    );
    score += selfPrSimilarity * 15;
    totalWeight += 15;
    
    // 年齢の近さ (±3歳以内なら高スコア)
    const ageDiff = Math.abs(candidate1.age - candidate2.age);
    if (ageDiff <= 3) {
      score += 5;
    } else if (ageDiff <= 7) {
      score += 3;
    } else if (ageDiff <= 10) {
      score += 1;
    }
    totalWeight += 5;
    
    // SPI結果の類似性
    if (candidate1.spiResults && candidate2.spiResults) {
      const spiScoreDiff = Math.abs(
        candidate1.spiResults.totalScore - candidate2.spiResults.totalScore
      );
      
      if (spiScoreDiff <= 5) {
        score += 10;
      } else if (spiScoreDiff <= 10) {
        score += 7;
      } else if (spiScoreDiff <= 15) {
        score += 4;
      } else if (spiScoreDiff <= 20) {
        score += 2;
      }
      totalWeight += 10;
    }
    
    // 0-100の範囲に正規化
    return totalWeight > 0 ? (score / totalWeight) * 100 : 0;
  }
  
  // テキストの類似度を計算する (簡易版)
  private calculateTextSimilarity(text1: string, text2: string): number {
    if (!text1 || !text2) return 0;
    
    // 単語に分解して共通単語の割合を計算
    const words1 = this.extractKeywords(text1);
    const words2 = this.extractKeywords(text2);
    
    if (words1.length === 0 || words2.length === 0) return 0;
    
    // 共通単語をカウント
    const commonWords = words1.filter(word => words2.includes(word));
    
    // Jaccard係数を計算
    const union = new Set([...words1, ...words2]);
    return commonWords.length / union.size;
  }
  
  // テキストからキーワードを抽出
  private extractKeywords(text: string): string[] {
    // 簡易的な前処理
    const normalized = text
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .replace(/\s{2,}/g, " ");
    
    // 単語に分割
    const words = normalized.split(/\s+/);
    
    // ストップワードを除去 (日本語対応は簡易的)
    const stopWords = ["の", "に", "は", "を", "た", "が", "で", "て", "と", "し", "れ", "さ", "ある", "いる", "する", "ます", "です", "した", "から", "など", "その", "この", "これ", "それ", "あの", "あれ"];
    return words.filter(word => word.length > 1 && !stopWords.includes(word));
  }
  
  // 類似性の理由を取得
  private getSimilarityReasons(candidate1: Candidate, candidate2: Candidate): string[] {
    const reasons: string[] = [];
    
    // 職種の一致
    if (candidate1.appliedPosition === candidate2.appliedPosition) {
      reasons.push(`同じ職種「${this.getJobTypeLabel(candidate1.appliedPosition)}」に応募`);
    }
    
    // 学歴の類似性
    if (this.calculateTextSimilarity(candidate1.education, candidate2.education) > 0.5) {
      reasons.push('類似した学歴背景');
    }
    
    // 専攻の類似性
    if (candidate1.major && candidate2.major && 
        this.calculateTextSimilarity(candidate1.major, candidate2.major) > 0.5) {
      reasons.push('類似した専攻分野');
    }
    
    // 経験の類似性
    if (this.calculateTextSimilarity(candidate1.experience, candidate2.experience) > 0.4) {
      reasons.push('類似した職務経験');
    }
    
    // 自己PRの類似性
    if (this.calculateTextSimilarity(candidate1.selfPr, candidate2.selfPr) > 0.3) {
      reasons.push('類似した自己PR内容');
    }
    
    // 年齢の近さ
    const ageDiff = Math.abs(candidate1.age - candidate2.age);
    if (ageDiff <= 3) {
      reasons.push('近い年齢層');
    }
    
    // SPI結果の類似性
    if (candidate1.spiResults && candidate2.spiResults) {
      const spiScoreDiff = Math.abs(
        candidate1.spiResults.totalScore - candidate2.spiResults.totalScore
      );
      
      if (spiScoreDiff <= 10) {
        reasons.push('類似したSPI適性検査結果');
      }
    }
    
    return reasons;
  }
  
  // 職種名を取得
  private getJobTypeLabel(jobType: string): string {
    const jobTypeLabels: Record<string, string> = {
      'fresh_sales': '新卒営業',
      'experienced_sales': '中途営業',
      'specialist': '中途専門職',
      'engineer': 'エンジニア',
      'part_time_base': 'アルバイト（拠点）',
      'part_time_sales': 'アルバイト（営業）',
      'finance_accounting': '財務経理',
      'human_resources': '人事',
      'business_development': '事業開発',
      'marketing': 'マーケティング'
    };
    
    return jobTypeLabels[jobType] || jobType;
  }
  
  // 採用データの統計を取得
  public getHiringStatistics() {
    const evaluations = getEvaluations();
    const completedEvaluations = evaluations.filter(e => e.isComplete && e.finalDecision);
    
    const totalEvaluated = completedEvaluations.length;
    const hired = completedEvaluations.filter(e => e.finalDecision === 'hired').length;
    const rejected = completedEvaluations.filter(e => e.finalDecision === 'rejected').length;
    
    // 職種別の採用率
    const jobTypeStats: Record<string, { total: number, hired: number, rate: number }> = {};
    
    completedEvaluations.forEach(evaluation => {
      const jobType = evaluation.jobType;
      
      if (!jobTypeStats[jobType]) {
        jobTypeStats[jobType] = { total: 0, hired: 0, rate: 0 };
      }
      
      jobTypeStats[jobType].total++;
      
      if (evaluation.finalDecision === 'hired') {
        jobTypeStats[jobType].hired++;
      }
    });
    
    // 採用率を計算
    Object.keys(jobTypeStats).forEach(jobType => {
      const stats = jobTypeStats[jobType];
      stats.rate = stats.total > 0 ? (stats.hired / stats.total) * 100 : 0;
    });
    
    return {
      totalEvaluated,
      hired,
      rejected,
      overallHiringRate: totalEvaluated > 0 ? (hired / totalEvaluated) * 100 : 0,
      jobTypeStats
    };
  }
  
  // 採用予測を行う
  public predictHiringOutcome(candidate: Candidate, evaluation: Partial<Evaluation>): {
    prediction: 'hire' | 'reject';
    confidence: number;
    reasons: string[];
  } {
    // 類似候補者を取得
    const similarCandidates = this.findSimilarCandidates(candidate, 10);
    
    if (similarCandidates.length === 0) {
      return {
        prediction: 'hire', // デフォルト
        confidence: 0.5,
        reasons: ['十分な過去データがないため、予測の信頼性は低いです']
      };
    }
    
    // 類似候補者の採用結果を集計
    const hiredCount = similarCandidates.filter(
      sc => sc.evaluation.finalDecision === 'hired'
    ).length;
    
    const hireRate = hiredCount / similarCandidates.length;
    
    // 現在の評価スコアの平均
    let currentScoreAvg = 0;
    if (evaluation.scores) {
      const scores = Object.values(evaluation.scores);
      currentScoreAvg = scores.length > 0 
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0;
    }
    
    // 採用された類似候補者のスコア平均
    const hiredSimilarCandidates = similarCandidates.filter(
      sc => sc.evaluation.finalDecision === 'hired'
    );
    
    let hiredScoreAvg = 0;
    if (hiredSimilarCandidates.length > 0) {
      const hiredScores = hiredSimilarCandidates.flatMap(sc => 
        Object.values(sc.evaluation.scores)
      );
      
      hiredScoreAvg = hiredScores.length > 0
        ? hiredScores.reduce((sum, score) => sum + score, 0) / hiredScores.length
        : 0;
    }
    
    // 予測理由
    const reasons: string[] = [];
    
    if (similarCandidates.length >= 3) {
      reasons.push(`${similarCandidates.length}名の類似候補者のうち${hiredCount}名が採用されています（採用率: ${(hireRate * 100).toFixed(1)}%）`);
    }
    
    if (hiredSimilarCandidates.length > 0) {
      reasons.push(`採用された類似候補者の平均スコアは${hiredScoreAvg.toFixed(1)}点でした`);
      
      if (currentScoreAvg > 0) {
        if (currentScoreAvg >= hiredScoreAvg) {
          reasons.push(`現在の評価スコア(${currentScoreAvg.toFixed(1)})は採用された類似候補者の平均以上です`);
        } else {
          reasons.push(`現在の評価スコア(${currentScoreAvg.toFixed(1)})は採用された類似候補者の平均を下回っています`);
        }
      }
    }
    
    // 採用予測
    let prediction: 'hire' | 'reject' = 'reject';
    let confidence = 0.5;
    
    if (hireRate >= 0.7) {
      prediction = 'hire';
      confidence = 0.7 + (hireRate - 0.7) * 0.5; // 0.7-0.85
    } else if (hireRate >= 0.5) {
      prediction = 'hire';
      confidence = 0.5 + (hireRate - 0.5) * 1.0; // 0.5-0.7
    } else if (hireRate >= 0.3) {
      prediction = 'reject';
      confidence = 0.5 + (0.5 - hireRate) * 1.0; // 0.5-0.7
    } else {
      prediction = 'reject';
      confidence = 0.7 + (0.3 - hireRate) * 0.5; // 0.7-0.85
    }
    
    // 現在のスコアが高い場合は採用予測を調整
    if (currentScoreAvg >= 3.5 && prediction === 'reject') {
      prediction = 'hire';
      confidence = Math.max(0.6, confidence - 0.1);
      reasons.push('現在の高評価スコアにより採用予測を調整しました');
    } else if (currentScoreAvg <= 2.0 && prediction === 'hire') {
      prediction = 'reject';
      confidence = Math.max(0.6, confidence - 0.1);
      reasons.push('現在の低評価スコアにより不採用予測を調整しました');
    }
    
    return {
      prediction,
      confidence,
      reasons
    };
  }
}