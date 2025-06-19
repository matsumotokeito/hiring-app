import { Candidate, SPIResults, SPIAnalysis, JobType } from '../types';

export class SPIAnalyzer {
  
  public analyzeSPI(candidate: Candidate, jobType: JobType): SPIAnalysis | null {
    if (!candidate.spiResults) {
      return null;
    }

    const spi = candidate.spiResults;
    const jobFitScore = this.calculateJobFitScore(spi, jobType);
    const strengthAreas = this.identifyStrengthAreas(spi);
    const developmentAreas = this.identifyDevelopmentAreas(spi);
    const personalityInsights = this.generatePersonalityInsights(spi);
    const recommendedRole = this.getRecommendedRole(spi, jobType);
    const teamFit = this.assessTeamFit(spi);
    const managementPotential = this.calculateManagementPotential(spi);
    const riskFactors = this.identifyRiskFactors(spi);
    const recommendations = this.generateRecommendations(spi, jobType);

    return {
      jobFitScore,
      strengthAreas,
      developmentAreas,
      personalityInsights,
      recommendedRole,
      teamFit,
      managementPotential,
      riskFactors,
      recommendations
    };
  }

  private calculateJobFitScore(spi: SPIResults, jobType: JobType): number {
    const jobFit = spi.personality.jobFit;
    const cognitive = spi.personality.cognitive;
    const behavioral = spi.personality.behavioral;

    let baseScore = 0;
    let weights = { jobFit: 0.4, cognitive: 0.3, behavioral: 0.3 };

    switch (jobType) {
      case 'fresh_sales':
      case 'experienced_sales':
        baseScore = jobFit.sales * weights.jobFit +
                   (cognitive.practical + cognitive.strategic) / 2 * weights.cognitive +
                   (behavioral.communication + behavioral.initiative + behavioral.persistence) / 3 * weights.behavioral;
        break;
      
      case 'engineer':
        baseScore = jobFit.technical * weights.jobFit +
                   (cognitive.analytical + cognitive.practical) / 2 * weights.cognitive +
                   (behavioral.persistence + behavioral.adaptability) / 2 * weights.behavioral;
        break;
      
      case 'specialist':
        baseScore = (jobFit.technical + jobFit.management) / 2 * weights.jobFit +
                   (cognitive.analytical + cognitive.strategic) / 2 * weights.cognitive +
                   (behavioral.leadership + behavioral.initiative) / 2 * weights.behavioral;
        break;
      
      case 'part_time_store':
        baseScore = jobFit.service * weights.jobFit +
                   (cognitive.practical) * weights.cognitive +
                   (behavioral.teamwork + behavioral.communication + behavioral.adaptability) / 3 * weights.behavioral;
        break;
      
      case 'part_time_sales':
        baseScore = (jobFit.sales + jobFit.service) / 2 * weights.jobFit +
                   (cognitive.practical) * weights.cognitive +
                   (behavioral.communication + behavioral.persistence + behavioral.initiative) / 3 * weights.behavioral;
        break;
      
      default:
        baseScore = (jobFit.sales + jobFit.technical + jobFit.management) / 3 * weights.jobFit +
                   (cognitive.analytical + cognitive.practical) / 2 * weights.cognitive +
                   (behavioral.teamwork + behavioral.communication) / 2 * weights.behavioral;
    }

    // 能力検査スコアも考慮
    const abilityScore = (spi.language.totalScore + spi.nonVerbal.totalScore) / 2;
    const abilityWeight = 0.2;
    
    const finalScore = baseScore * (1 - abilityWeight) + (abilityScore / 100) * 100 * abilityWeight;
    
    return Math.round(Math.max(0, Math.min(100, finalScore)));
  }

  private identifyStrengthAreas(spi: SPIResults): string[] {
    const strengths: string[] = [];
    const behavioral = spi.personality.behavioral;
    const cognitive = spi.personality.cognitive;
    const emotional = spi.personality.emotional;

    // 行動特性の強み
    if (behavioral.leadership >= 70) strengths.push('リーダーシップ');
    if (behavioral.teamwork >= 70) strengths.push('チームワーク');
    if (behavioral.initiative >= 70) strengths.push('積極性・主体性');
    if (behavioral.persistence >= 70) strengths.push('粘り強さ・継続力');
    if (behavioral.adaptability >= 70) strengths.push('適応性・柔軟性');
    if (behavioral.communication >= 70) strengths.push('コミュニケーション能力');

    // 思考特性の強み
    if (cognitive.analytical >= 70) strengths.push('分析的思考力');
    if (cognitive.creative >= 70) strengths.push('創造的思考力');
    if (cognitive.practical >= 70) strengths.push('実践的思考力');
    if (cognitive.strategic >= 70) strengths.push('戦略的思考力');

    // 情緒特性の強み
    if (emotional.stability >= 70) strengths.push('情緒安定性');
    if (emotional.stress >= 70) strengths.push('ストレス耐性');
    if (emotional.optimism >= 70) strengths.push('楽観性・前向きさ');
    if (emotional.empathy >= 70) strengths.push('共感性・理解力');

    // 能力検査の強み
    if (spi.language.totalScore >= 60) strengths.push('言語能力');
    if (spi.nonVerbal.totalScore >= 60) strengths.push('数理・論理的思考');

    return strengths.slice(0, 5); // 上位5つまで
  }

  private identifyDevelopmentAreas(spi: SPIResults): string[] {
    const developments: string[] = [];
    const behavioral = spi.personality.behavioral;
    const cognitive = spi.personality.cognitive;
    const emotional = spi.personality.emotional;

    // 改善が必要な領域を特定
    if (behavioral.leadership < 40) developments.push('リーダーシップの発揮');
    if (behavioral.teamwork < 40) developments.push('チームワークの向上');
    if (behavioral.initiative < 40) developments.push('積極性の向上');
    if (behavioral.persistence < 40) developments.push('継続力の強化');
    if (behavioral.communication < 40) developments.push('コミュニケーション力の向上');

    if (cognitive.analytical < 40) developments.push('分析力の強化');
    if (cognitive.practical < 40) developments.push('実践力の向上');

    if (emotional.stability < 40) developments.push('情緒安定性の向上');
    if (emotional.stress < 40) developments.push('ストレス管理能力の向上');

    if (spi.language.totalScore < 40) developments.push('言語能力の向上');
    if (spi.nonVerbal.totalScore < 40) developments.push('数理・論理思考力の向上');

    return developments.slice(0, 3); // 上位3つまで
  }

  private generatePersonalityInsights(spi: SPIResults): string[] {
    const insights: string[] = [];
    const behavioral = spi.personality.behavioral;
    const cognitive = spi.personality.cognitive;
    const emotional = spi.personality.emotional;

    // 行動パターンの洞察
    if (behavioral.leadership > 60 && behavioral.teamwork > 60) {
      insights.push('リーダーシップとチームワークのバランスが良く、組織の中核として活躍できる');
    }
    
    if (behavioral.initiative > 70 && behavioral.persistence > 70) {
      insights.push('高い積極性と継続力を持ち、困難な課題にも粘り強く取り組める');
    }

    if (cognitive.analytical > 60 && cognitive.practical > 60) {
      insights.push('分析力と実践力を兼ね備え、理論と実務の両面で力を発揮できる');
    }

    if (emotional.stability > 60 && emotional.stress > 60) {
      insights.push('情緒が安定しており、プレッシャーの多い環境でも冷静に対応できる');
    }

    if (behavioral.communication > 70 && emotional.empathy > 60) {
      insights.push('優れたコミュニケーション能力と共感性を持ち、対人関係を円滑に築ける');
    }

    // 特徴的なパターンの識別
    if (cognitive.creative > 70 && cognitive.analytical < 50) {
      insights.push('創造性に富むが、分析的アプローチの強化が課題');
    }

    if (behavioral.leadership > 70 && behavioral.teamwork < 50) {
      insights.push('リーダーシップは高いが、チームメンバーとしての協調性に注意が必要');
    }

    return insights.slice(0, 4);
  }

  private getRecommendedRole(spi: SPIResults, jobType: JobType): string {
    const jobFit = spi.personality.jobFit;
    const behavioral = spi.personality.behavioral;
    const cognitive = spi.personality.cognitive;

    // 職種適性スコアが最も高い領域を特定
    const maxJobFit = Math.max(jobFit.sales, jobFit.management, jobFit.technical, jobFit.creative, jobFit.service);

    if (jobFit.sales === maxJobFit && jobFit.sales > 60) {
      if (behavioral.leadership > 60) {
        return '営業チームリーダー・マネージャー';
      } else {
        return '営業スペシャリスト';
      }
    }

    if (jobFit.management === maxJobFit && jobFit.management > 60) {
      return 'プロジェクトマネージャー・管理職候補';
    }

    if (jobFit.technical === maxJobFit && jobFit.technical > 60) {
      if (cognitive.creative > 60) {
        return 'テクニカルスペシャリスト・イノベーター';
      } else {
        return 'エンジニア・技術者';
      }
    }

    if (jobFit.creative === maxJobFit && jobFit.creative > 60) {
      return 'クリエイティブ・企画職';
    }

    if (jobFit.service === maxJobFit && jobFit.service > 60) {
      return 'カスタマーサービス・サポート';
    }

    // 応募職種に基づくデフォルト推奨
    switch (jobType) {
      case 'fresh_sales':
        return '新卒営業職（基礎から育成）';
      case 'experienced_sales':
        return '中途営業職（即戦力）';
      case 'engineer':
        return 'エンジニア職';
      case 'specialist':
        return '専門職';
      case 'part_time_store':
        return 'アルバイトスタッフ（店舗・拠点）';
      case 'part_time_sales':
        return 'アルバイトスタッフ（営業サポート）';
      default:
        return '総合職・適性に応じた配置';
    }
  }

  private assessTeamFit(spi: SPIResults): 'high' | 'medium' | 'low' {
    const behavioral = spi.personality.behavioral;
    const emotional = spi.personality.emotional;

    const teamScore = (
      behavioral.teamwork * 0.3 +
      behavioral.communication * 0.25 +
      emotional.empathy * 0.2 +
      behavioral.adaptability * 0.15 +
      emotional.stability * 0.1
    );

    if (teamScore >= 65) return 'high';
    if (teamScore >= 45) return 'medium';
    return 'low';
  }

  private calculateManagementPotential(spi: SPIResults): number {
    const behavioral = spi.personality.behavioral;
    const cognitive = spi.personality.cognitive;
    const emotional = spi.personality.emotional;
    const jobFit = spi.personality.jobFit;

    const managementScore = (
      behavioral.leadership * 0.25 +
      cognitive.strategic * 0.2 +
      behavioral.communication * 0.15 +
      emotional.stability * 0.15 +
      jobFit.management * 0.1 +
      behavioral.initiative * 0.1 +
      emotional.stress * 0.05
    );

    return Math.round(Math.max(0, Math.min(100, managementScore)));
  }

  private identifyRiskFactors(spi: SPIResults): string[] {
    const risks: string[] = [];
    const behavioral = spi.personality.behavioral;
    const emotional = spi.personality.emotional;

    if (emotional.stability < 30) {
      risks.push('情緒不安定性によるパフォーマンスの変動');
    }

    if (emotional.stress < 30) {
      risks.push('ストレス耐性の低さによる離職リスク');
    }

    if (behavioral.teamwork < 30) {
      risks.push('チームワーク不足による組織適応の困難');
    }

    if (behavioral.communication < 30) {
      risks.push('コミュニケーション不足による誤解や摩擦');
    }

    if (behavioral.adaptability < 30) {
      risks.push('変化への適応困難による業務効率の低下');
    }

    if (spi.reliability === 'low') {
      risks.push('回答の信頼性が低く、結果の解釈に注意が必要');
    }

    return risks.slice(0, 3);
  }

  private generateRecommendations(spi: SPIResults, jobType: JobType): string[] {
    const recommendations: string[] = [];
    const behavioral = spi.personality.behavioral;
    const cognitive = spi.personality.cognitive;
    const emotional = spi.personality.emotional;

    // 強みを活かす推奨事項
    if (behavioral.leadership > 60) {
      recommendations.push('リーダーシップを活かせるプロジェクトや役割を早期に付与');
    }

    if (cognitive.analytical > 60) {
      recommendations.push('分析力を活かせる企画・戦略業務への参画機会を提供');
    }

    if (behavioral.communication > 60) {
      recommendations.push('対外折衝や社内調整役としての活用を検討');
    }

    // 改善領域への対応
    if (emotional.stress < 50) {
      recommendations.push('ストレス管理研修やメンタルヘルスサポートの提供');
    }

    if (behavioral.teamwork < 50) {
      recommendations.push('チームビルディング研修やグループワークの機会を増加');
    }

    if (cognitive.practical < 50) {
      recommendations.push('実務経験を積める OJT や現場研修を重視');
    }

    // 職種別の推奨事項
    switch (jobType) {
      case 'fresh_sales':
        recommendations.push('営業基礎研修と先輩社員によるメンタリング制度の活用');
        break;
      case 'experienced_sales':
        recommendations.push('既存スキルを活かしつつ、社内文化への適応支援を重視');
        break;
      case 'engineer':
        recommendations.push('技術研修と並行して、コミュニケーション力向上の機会を提供');
        break;
      case 'specialist':
        recommendations.push('専門性を活かせる環境整備と、組織貢献の機会を創出');
        break;
      case 'part_time_store':
        recommendations.push('接客スキル研修と店舗運営の基礎知識習得を支援');
        break;
      case 'part_time_sales':
        recommendations.push('営業基礎研修と電話応対スキルの向上を重点的に支援');
        break;
    }

    return recommendations.slice(0, 4);
  }

  public generateSPISummary(spi: SPIResults): string {
    const abilityLevel = this.getAbilityLevel(spi);
    const personalityType = this.getPersonalityType(spi);
    
    return `${abilityLevel}の基礎能力を持ち、${personalityType}な特性を示しています。` +
           `言語能力${spi.language.totalScore}点、非言語能力${spi.nonVerbal.totalScore}点で、` +
           `全体的に${spi.percentile}パーセンタイルの位置にあります。`;
  }

  private getAbilityLevel(spi: SPIResults): string {
    const avgScore = (spi.language.totalScore + spi.nonVerbal.totalScore) / 2;
    if (avgScore >= 60) return '高い';
    if (avgScore >= 45) return '標準的な';
    return '基礎的な';
  }

  private getPersonalityType(spi: SPIResults): string {
    const behavioral = spi.personality.behavioral;
    const cognitive = spi.personality.cognitive;
    
    if (behavioral.leadership > 60 && cognitive.strategic > 60) {
      return 'リーダーシップと戦略思考に優れた';
    }
    if (behavioral.teamwork > 60 && behavioral.communication > 60) {
      return 'チームワークとコミュニケーションに長けた';
    }
    if (cognitive.analytical > 60 && cognitive.practical > 60) {
      return '分析力と実践力を兼ね備えた';
    }
    if (behavioral.initiative > 60 && behavioral.persistence > 60) {
      return '積極的で粘り強い';
    }
    
    return 'バランスの取れた';
  }
}