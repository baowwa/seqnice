/**
 * 数据验证工具类
 * 
 * 功能说明：
 * - 提供实验数据的验证规则和质量控制功能
 * - 支持不同实验步骤的专业验证逻辑
 * - 提供数据完整性检查和异常值检测
 * - 支持自定义验证规则和阈值配置
 * - 集成数据质量评分和建议系统
 * 
 * @author 系统
 * @version 2.0.0
 */

/**
 * 验证级别枚举
 */
export enum ValidationLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * 验证结果接口
 */
export interface ValidationResult {
  /** 字段名 */
  field: string;
  /** 验证级别 */
  level: ValidationLevel;
  /** 错误消息 */
  message: string;
  /** 建议修复方案 */
  suggestion?: string;
  /** 当前值 */
  currentValue?: any;
  /** 期望值范围 */
  expectedRange?: string;
  /** 参考标准 */
  reference?: string;
}

/**
 * 验证规则接口
 */
export interface ValidationRule {
  /** 规则名称 */
  name: string;
  /** 字段名 */
  field: string;
  /** 验证函数 */
  validator: (value: any, record?: any) => ValidationResult | null;
  /** 是否必需 */
  required?: boolean;
  /** 规则描述 */
  description?: string;
}

/**
 * 质量控制标准接口
 */
export interface QualityStandard {
  /** 标准名称 */
  name: string;
  /** 参数名称 */
  parameter: string;
  /** 最小值 */
  minValue?: number;
  /** 最大值 */
  maxValue?: number;
  /** 理想值 */
  optimalValue?: number;
  /** 理想范围 */
  optimalRange?: [number, number];
  /** 单位 */
  unit?: string;
  /** 标准来源 */
  source?: string;
}

/**
 * 数据质量评分接口
 */
export interface QualityScore {
  /** 总分 */
  totalScore: number;
  /** 最大分数 */
  maxScore: number;
  /** 质量等级 */
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  /** 分项得分 */
  categoryScores: Record<string, number>;
  /** 改进建议 */
  improvements: string[];
}

/**
 * 核酸提取质量控制标准
 */
export const NUCLEIC_EXTRACTION_STANDARDS: QualityStandard[] = [
  {
    name: 'DNA浓度标准',
    parameter: 'dnaConcentration',
    minValue: 10,
    optimalRange: [50, 200],
    maxValue: 1000,
    unit: 'ng/μL',
    source: 'QIAGEN Protocol'
  },
  {
    name: 'DNA纯度标准',
    parameter: 'purity260_280',
    minValue: 1.6,
    optimalRange: [1.8, 2.0],
    maxValue: 2.2,
    unit: 'A260/A280',
    source: 'Thermo Fisher Guidelines'
  },
  {
    name: 'DNA体积标准',
    parameter: 'dnaVolume',
    minValue: 20,
    optimalRange: [50, 200],
    maxValue: 500,
    unit: 'μL',
    source: 'Laboratory Standard'
  },
  {
    name: 'RNA完整性标准',
    parameter: 'rnaIntegrity',
    minValue: 6.0,
    optimalRange: [8.0, 10.0],
    maxValue: 10.0,
    unit: 'RIN',
    source: 'Agilent Bioanalyzer'
  }
];

/**
 * PCR扩增质量控制标准
 */
export const PCR_AMPLIFICATION_STANDARDS: QualityStandard[] = [
  {
    name: 'PCR产物浓度标准',
    parameter: 'pcrProduct',
    minValue: 5,
    optimalRange: [20, 100],
    maxValue: 500,
    unit: 'ng/μL',
    source: 'PCR Protocol'
  },
  {
    name: '扩增效率标准',
    parameter: 'amplificationEfficiency',
    minValue: 80,
    optimalRange: [90, 110],
    maxValue: 120,
    unit: '%',
    source: 'qPCR Guidelines'
  },
  {
    name: '条带大小标准',
    parameter: 'bandSize',
    minValue: 100,
    optimalRange: [200, 800],
    maxValue: 2000,
    unit: 'bp',
    source: 'Gel Electrophoresis'
  },
  {
    name: 'Ct值标准',
    parameter: 'ctValue',
    minValue: 15,
    optimalRange: [20, 30],
    maxValue: 35,
    unit: 'Ct',
    source: 'Real-time PCR'
  }
];

/**
 * 文库构建质量控制标准
 */
export const LIBRARY_CONSTRUCTION_STANDARDS: QualityStandard[] = [
  {
    name: '文库浓度标准',
    parameter: 'libraryConcentration',
    minValue: 2,
    optimalRange: [10, 50],
    maxValue: 200,
    unit: 'ng/μL',
    source: 'Illumina Protocol'
  },
  {
    name: '片段大小标准',
    parameter: 'fragmentSize',
    minValue: 200,
    optimalRange: [300, 500],
    maxValue: 800,
    unit: 'bp',
    source: 'Bioanalyzer'
  },
  {
    name: '文库摩尔浓度标准',
    parameter: 'molarConcentration',
    minValue: 2,
    optimalRange: [4, 20],
    maxValue: 50,
    unit: 'nM',
    source: 'Sequencing Guidelines'
  },
  {
    name: '适配器二聚体比例',
    parameter: 'adapterDimerRatio',
    minValue: 0,
    optimalRange: [0, 5],
    maxValue: 10,
    unit: '%',
    source: 'Quality Control'
  }
];

/**
 * 数据验证器类
 */
export class DataValidator {
  private rules: ValidationRule[] = [];
  private standards: QualityStandard[] = [];

  /**
   * 构造函数
   * @param experimentType 实验类型
   */
  constructor(experimentType: 'nucleic_extraction' | 'pcr_amplification' | 'library_construction') {
    this.initializeRules(experimentType);
    this.initializeStandards(experimentType);
  }

  /**
   * 初始化验证规则
   * @param experimentType 实验类型
   */
  private initializeRules(experimentType: string): void {
    switch (experimentType) {
      case 'nucleic_extraction':
        this.rules = this.getNucleicExtractionRules();
        break;
      case 'pcr_amplification':
        this.rules = this.getPCRAmplificationRules();
        break;
      case 'library_construction':
        this.rules = this.getLibraryConstructionRules();
        break;
    }
  }

  /**
   * 初始化质量标准
   * @param experimentType 实验类型
   */
  private initializeStandards(experimentType: string): void {
    switch (experimentType) {
      case 'nucleic_extraction':
        this.standards = NUCLEIC_EXTRACTION_STANDARDS;
        break;
      case 'pcr_amplification':
        this.standards = PCR_AMPLIFICATION_STANDARDS;
        break;
      case 'library_construction':
        this.standards = LIBRARY_CONSTRUCTION_STANDARDS;
        break;
    }
  }

  /**
   * 获取核酸提取验证规则
   * @returns 验证规则数组
   */
  private getNucleicExtractionRules(): ValidationRule[] {
    return [
      {
        name: '样本编号验证',
        field: 'sampleCode',
        required: true,
        validator: (value: string) => {
          if (!value || value.trim() === '') {
            return {
              field: 'sampleCode',
              level: ValidationLevel.ERROR,
              message: '样本编号不能为空',
              suggestion: '请输入有效的样本编号'
            };
          }
          
          // 检查样本编号格式
          const sampleCodePattern = /^[A-Z]{2,3}\d{3,6}$/;
          if (!sampleCodePattern.test(value)) {
            return {
              field: 'sampleCode',
              level: ValidationLevel.WARNING,
              message: '样本编号格式不规范',
              suggestion: '建议使用格式：字母(2-3位) + 数字(3-6位)，如 DNA001',
              currentValue: value,
              expectedRange: '如：DNA001, RNA123456'
            };
          }
          
          return null;
        }
      },
      {
        name: 'DNA浓度验证',
        field: 'dnaConcentration',
        required: true,
        validator: (value: number) => {
          if (value === undefined || value === null) {
            return {
              field: 'dnaConcentration',
              level: ValidationLevel.ERROR,
              message: 'DNA浓度不能为空',
              suggestion: '请输入DNA浓度值'
            };
          }
          
          if (value < 0) {
            return {
              field: 'dnaConcentration',
              level: ValidationLevel.ERROR,
              message: 'DNA浓度不能为负数',
              suggestion: '请输入有效的浓度值',
              currentValue: value
            };
          }
          
          if (value < 10) {
            return {
              field: 'dnaConcentration',
              level: ValidationLevel.WARNING,
              message: 'DNA浓度过低，可能影响后续实验',
              suggestion: '建议重新提取或浓缩样本，目标浓度 ≥ 50 ng/μL',
              currentValue: value,
              expectedRange: '≥ 10 ng/μL (理想值: 50-200 ng/μL)',
              reference: 'QIAGEN Protocol'
            };
          }
          
          if (value > 1000) {
            return {
              field: 'dnaConcentration',
              level: ValidationLevel.ERROR,
              message: 'DNA浓度异常高，请检查测量结果',
              suggestion: '建议重新测量或稀释样本',
              currentValue: value,
              expectedRange: '< 1000 ng/μL',
              reference: 'Laboratory Standard'
            };
          }
          
          if (value > 200) {
            return {
              field: 'dnaConcentration',
              level: ValidationLevel.INFO,
              message: 'DNA浓度较高，建议适当稀释',
              suggestion: '可稀释至 50-200 ng/μL 范围内使用',
              currentValue: value,
              expectedRange: '理想值: 50-200 ng/μL'
            };
          }
          
          return null;
        }
      },
      {
        name: 'DNA纯度验证',
        field: 'purity260_280',
        validator: (value: number) => {
          if (value === undefined || value === null) {
            return {
              field: 'purity260_280',
              level: ValidationLevel.INFO,
              message: '建议测量DNA纯度',
              suggestion: '纯度测量有助于评估DNA质量'
            };
          }
          
          if (value < 1.6) {
            return {
              field: 'purity260_280',
              level: ValidationLevel.WARNING,
              message: 'DNA纯度偏低，可能含有蛋白质污染',
              suggestion: '建议重新纯化或使用蛋白酶K处理',
              currentValue: value,
              expectedRange: '1.8-2.0 (可接受范围: 1.6-2.2)',
              reference: 'Thermo Fisher Guidelines'
            };
          }
          
          if (value > 2.2) {
            return {
              field: 'purity260_280',
              level: ValidationLevel.WARNING,
              message: 'DNA纯度异常高，可能存在RNA污染',
              suggestion: '建议使用RNase A处理或重新提取',
              currentValue: value,
              expectedRange: '1.8-2.0 (可接受范围: 1.6-2.2)',
              reference: 'Thermo Fisher Guidelines'
            };
          }
          
          if (value >= 1.8 && value <= 2.0) {
            return {
              field: 'purity260_280',
              level: ValidationLevel.INFO,
              message: 'DNA纯度优秀',
              currentValue: value,
              expectedRange: '理想范围: 1.8-2.0'
            };
          }
          
          return null;
        }
      },
      {
        name: 'DNA体积验证',
        field: 'dnaVolume',
        required: true,
        validator: (value: number) => {
          if (value === undefined || value === null) {
            return {
              field: 'dnaVolume',
              level: ValidationLevel.ERROR,
              message: 'DNA体积不能为空',
              suggestion: '请输入DNA体积'
            };
          }
          
          if (value <= 0) {
            return {
              field: 'dnaVolume',
              level: ValidationLevel.ERROR,
              message: 'DNA体积必须大于0',
              suggestion: '请输入有效的体积值',
              currentValue: value
            };
          }
          
          if (value < 20) {
            return {
              field: 'dnaVolume',
              level: ValidationLevel.WARNING,
              message: 'DNA体积较少，可能不足以进行后续实验',
              suggestion: '建议体积 ≥ 50 μL',
              currentValue: value,
              expectedRange: '≥ 20 μL (建议: 50-200 μL)'
            };
          }
          
          if (value > 500) {
            return {
              field: 'dnaVolume',
              level: ValidationLevel.INFO,
              message: 'DNA体积较大',
              suggestion: '可考虑分装保存',
              currentValue: value
            };
          }
          
          return null;
        }
      }
    ];
  }

  /**
   * 获取PCR扩增验证规则
   * @returns 验证规则数组
   */
  private getPCRAmplificationRules(): ValidationRule[] {
    return [
      {
        name: '样本编号验证',
        field: 'sampleCode',
        required: true,
        validator: (value: string) => {
          if (!value || value.trim() === '') {
            return {
              field: 'sampleCode',
              level: ValidationLevel.ERROR,
              message: '样本编号不能为空',
              suggestion: '请输入有效的样本编号'
            };
          }
          return null;
        }
      },
      {
        name: 'PCR产物浓度验证',
        field: 'pcrProduct',
        required: true,
        validator: (value: number) => {
          if (value === undefined || value === null) {
            return {
              field: 'pcrProduct',
              level: ValidationLevel.ERROR,
              message: 'PCR产物浓度不能为空',
              suggestion: '请输入PCR产物浓度'
            };
          }
          
          if (value < 0) {
            return {
              field: 'pcrProduct',
              level: ValidationLevel.ERROR,
              message: 'PCR产物浓度不能为负数',
              currentValue: value
            };
          }
          
          if (value < 5) {
            return {
              field: 'pcrProduct',
              level: ValidationLevel.WARNING,
              message: 'PCR产物浓度过低',
              suggestion: '建议检查PCR条件或重新扩增',
              currentValue: value,
              expectedRange: '≥ 5 ng/μL (理想值: 20-100 ng/μL)',
              reference: 'PCR Protocol'
            };
          }
          
          if (value > 500) {
            return {
              field: 'pcrProduct',
              level: ValidationLevel.WARNING,
              message: 'PCR产物浓度异常高',
              suggestion: '建议检查测量结果或稀释样本',
              currentValue: value,
              expectedRange: '< 500 ng/μL'
            };
          }
          
          return null;
        }
      },
      {
        name: '扩增结果验证',
        field: 'amplificationSuccess',
        required: true,
        validator: (value: string) => {
          if (!value) {
            return {
              field: 'amplificationSuccess',
              level: ValidationLevel.ERROR,
              message: '请选择扩增结果',
              suggestion: '必须记录扩增是否成功'
            };
          }
          
          if (value === 'failed') {
            return {
              field: 'amplificationSuccess',
              level: ValidationLevel.WARNING,
              message: 'PCR扩增失败',
              suggestion: '建议检查引物、模板质量和反应条件',
              currentValue: value
            };
          }
          
          if (value === 'partial') {
            return {
              field: 'amplificationSuccess',
              level: ValidationLevel.INFO,
              message: 'PCR扩增部分成功',
              suggestion: '建议优化反应条件以提高成功率',
              currentValue: value
            };
          }
          
          return null;
        }
      },
      {
        name: '条带大小验证',
        field: 'bandSize',
        validator: (value: number, record: any) => {
          if (record?.amplificationSuccess === 'success' && !value) {
            return {
              field: 'bandSize',
              level: ValidationLevel.WARNING,
              message: '扩增成功时建议记录条带大小',
              suggestion: '条带大小有助于验证扩增产物的正确性'
            };
          }
          
          if (value && value < 50) {
            return {
              field: 'bandSize',
              level: ValidationLevel.WARNING,
              message: '条带大小异常小',
              suggestion: '请检查是否为目标产物',
              currentValue: value,
              expectedRange: '通常 > 100 bp'
            };
          }
          
          if (value && value > 5000) {
            return {
              field: 'bandSize',
              level: ValidationLevel.WARNING,
              message: '条带大小异常大',
              suggestion: '请检查是否存在非特异性扩增',
              currentValue: value,
              expectedRange: '通常 < 2000 bp'
            };
          }
          
          return null;
        }
      }
    ];
  }

  /**
   * 获取文库构建验证规则
   * @returns 验证规则数组
   */
  private getLibraryConstructionRules(): ValidationRule[] {
    return [
      {
        name: '样本编号验证',
        field: 'sampleCode',
        required: true,
        validator: (value: string) => {
          if (!value || value.trim() === '') {
            return {
              field: 'sampleCode',
              level: ValidationLevel.ERROR,
              message: '样本编号不能为空',
              suggestion: '请输入有效的样本编号'
            };
          }
          return null;
        }
      },
      {
        name: '文库浓度验证',
        field: 'libraryConcentration',
        required: true,
        validator: (value: number) => {
          if (value === undefined || value === null) {
            return {
              field: 'libraryConcentration',
              level: ValidationLevel.ERROR,
              message: '文库浓度不能为空',
              suggestion: '请输入文库浓度'
            };
          }
          
          if (value < 0) {
            return {
              field: 'libraryConcentration',
              level: ValidationLevel.ERROR,
              message: '文库浓度不能为负数',
              currentValue: value
            };
          }
          
          if (value < 2) {
            return {
              field: 'libraryConcentration',
              level: ValidationLevel.ERROR,
              message: '文库浓度过低，无法进行测序',
              suggestion: '建议重新构建文库或浓缩样本，目标浓度 ≥ 10 ng/μL',
              currentValue: value,
              expectedRange: '≥ 2 ng/μL (理想值: 10-50 ng/μL)',
              reference: 'Illumina Protocol'
            };
          }
          
          if (value > 200) {
            return {
              field: 'libraryConcentration',
              level: ValidationLevel.WARNING,
              message: '文库浓度过高',
              suggestion: '建议稀释至适当浓度以避免过载',
              currentValue: value,
              expectedRange: '< 200 ng/μL'
            };
          }
          
          return null;
        }
      },
      {
        name: '片段大小验证',
        field: 'fragmentSize',
        required: true,
        validator: (value: number) => {
          if (value === undefined || value === null) {
            return {
              field: 'fragmentSize',
              level: ValidationLevel.ERROR,
              message: '片段大小不能为空',
              suggestion: '请输入文库片段大小'
            };
          }
          
          if (value < 100) {
            return {
              field: 'fragmentSize',
              level: ValidationLevel.WARNING,
              message: '片段大小过小',
              suggestion: '可能影响测序质量，建议片段大小 ≥ 200 bp',
              currentValue: value,
              expectedRange: '≥ 200 bp (理想值: 300-500 bp)',
              reference: 'Bioanalyzer'
            };
          }
          
          if (value > 1000) {
            return {
              field: 'fragmentSize',
              level: ValidationLevel.WARNING,
              message: '片段大小过大',
              suggestion: '可能影响测序效率，建议片段大小 ≤ 800 bp',
              currentValue: value,
              expectedRange: '≤ 800 bp (理想值: 300-500 bp)',
              reference: 'Sequencing Guidelines'
            };
          }
          
          return null;
        }
      },
      {
        name: '质控状态验证',
        field: 'qcStatus',
        required: true,
        validator: (value: string) => {
          if (!value) {
            return {
              field: 'qcStatus',
              level: ValidationLevel.ERROR,
              message: '请选择质控状态',
              suggestion: '必须记录文库质控结果'
            };
          }
          
          if (value === 'fail') {
            return {
              field: 'qcStatus',
              level: ValidationLevel.ERROR,
              message: '文库质控失败',
              suggestion: '建议重新构建文库或检查实验条件',
              currentValue: value
            };
          }
          
          if (value === 'warning') {
            return {
              field: 'qcStatus',
              level: ValidationLevel.WARNING,
              message: '文库质控存在警告',
              suggestion: '建议检查相关参数并评估是否需要重新制备',
              currentValue: value
            };
          }
          
          return null;
        }
      }
    ];
  }

  /**
   * 验证单条记录
   * @param record 记录数据
   * @returns 验证结果数组
   */
  public validateRecord(record: any): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    this.rules.forEach(rule => {
      const value = record[rule.field];
      const result = rule.validator(value, record);
      
      if (result) {
        results.push(result);
      }
    });
    
    return results;
  }

  /**
   * 批量验证记录
   * @param records 记录数组
   * @returns 验证结果映射
   */
  public validateRecords(records: any[]): Map<string, ValidationResult[]> {
    const resultsMap = new Map<string, ValidationResult[]>();
    
    records.forEach(record => {
      const recordId = record.id || record.sampleCode || 'unknown';
      const results = this.validateRecord(record);
      resultsMap.set(recordId, results);
    });
    
    return resultsMap;
  }

  /**
   * 计算数据质量评分
   * @param record 记录数据
   * @returns 质量评分
   */
  public calculateQualityScore(record: any): QualityScore {
    const validationResults = this.validateRecord(record);
    
    let totalScore = 100;
    const maxScore = 100;
    const categoryScores: Record<string, number> = {
      completeness: 100,
      accuracy: 100,
      consistency: 100,
      reliability: 100
    };
    const improvements: string[] = [];
    
    // 根据验证结果扣分
    validationResults.forEach(result => {
      switch (result.level) {
        case ValidationLevel.CRITICAL:
          totalScore -= 25;
          categoryScores.reliability -= 25;
          improvements.push(`严重错误: ${result.message}`);
          break;
        case ValidationLevel.ERROR:
          totalScore -= 15;
          categoryScores.accuracy -= 15;
          improvements.push(`错误: ${result.message}`);
          break;
        case ValidationLevel.WARNING:
          totalScore -= 8;
          categoryScores.consistency -= 8;
          improvements.push(`警告: ${result.message}`);
          break;
        case ValidationLevel.INFO:
          totalScore -= 2;
          categoryScores.completeness -= 2;
          break;
      }
    });
    
    // 检查数据完整性
    const requiredFields = this.rules.filter(rule => rule.required).map(rule => rule.field);
    const missingFields = requiredFields.filter(field => !record[field]);
    
    if (missingFields.length > 0) {
      const penalty = missingFields.length * 10;
      totalScore -= penalty;
      categoryScores.completeness -= penalty;
      improvements.push(`缺少必填字段: ${missingFields.join(', ')}`);
    }
    
    // 确保分数不为负数
    totalScore = Math.max(0, totalScore);
    Object.keys(categoryScores).forEach(key => {
      categoryScores[key] = Math.max(0, categoryScores[key]);
    });
    
    // 计算质量等级
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (totalScore >= 90) grade = 'A';
    else if (totalScore >= 80) grade = 'B';
    else if (totalScore >= 70) grade = 'C';
    else if (totalScore >= 60) grade = 'D';
    else grade = 'F';
    
    return {
      totalScore,
      maxScore,
      grade,
      categoryScores,
      improvements
    };
  }

  /**
   * 获取质量控制标准
   * @param parameter 参数名
   * @returns 质量标准
   */
  public getQualityStandard(parameter: string): QualityStandard | undefined {
    return this.standards.find(standard => standard.parameter === parameter);
  }

  /**
   * 检查数值是否在标准范围内
   * @param parameter 参数名
   * @param value 数值
   * @returns 检查结果
   */
  public checkValueAgainstStandard(parameter: string, value: number): {
    isValid: boolean;
    level: ValidationLevel;
    message: string;
    standard?: QualityStandard;
  } {
    const standard = this.getQualityStandard(parameter);
    
    if (!standard) {
      return {
        isValid: true,
        level: ValidationLevel.INFO,
        message: '未找到相关质量标准'
      };
    }
    
    // 检查是否在理想范围内
    if (standard.optimalRange && 
        value >= standard.optimalRange[0] && 
        value <= standard.optimalRange[1]) {
      return {
        isValid: true,
        level: ValidationLevel.INFO,
        message: `${parameter}在理想范围内`,
        standard
      };
    }
    
    // 检查是否超出最大值
    if (standard.maxValue && value > standard.maxValue) {
      return {
        isValid: false,
        level: ValidationLevel.ERROR,
        message: `${parameter}超出最大允许值 ${standard.maxValue} ${standard.unit || ''}`,
        standard
      };
    }
    
    // 检查是否低于最小值
    if (standard.minValue && value < standard.minValue) {
      return {
        isValid: false,
        level: ValidationLevel.WARNING,
        message: `${parameter}低于最小推荐值 ${standard.minValue} ${standard.unit || ''}`,
        standard
      };
    }
    
    return {
      isValid: true,
      level: ValidationLevel.INFO,
      message: `${parameter}在可接受范围内`,
      standard
    };
  }

  /**
   * 生成质量报告
   * @param records 记录数组
   * @returns 质量报告
   */
  public generateQualityReport(records: any[]): {
    summary: {
      totalRecords: number;
      validRecords: number;
      errorRecords: number;
      warningRecords: number;
      averageScore: number;
    };
    details: Array<{
      recordId: string;
      score: QualityScore;
      validationResults: ValidationResult[];
    }>;
    recommendations: string[];
  } {
    const details = records.map(record => {
      const recordId = record.id || record.sampleCode || 'unknown';
      const score = this.calculateQualityScore(record);
      const validationResults = this.validateRecord(record);
      
      return {
        recordId,
        score,
        validationResults
      };
    });
    
    const totalRecords = records.length;
    const validRecords = details.filter(d => d.score.grade === 'A' || d.score.grade === 'B').length;
    const errorRecords = details.filter(d => 
      d.validationResults.some(r => r.level === ValidationLevel.ERROR || r.level === ValidationLevel.CRITICAL)
    ).length;
    const warningRecords = details.filter(d => 
      d.validationResults.some(r => r.level === ValidationLevel.WARNING)
    ).length;
    const averageScore = details.reduce((sum, d) => sum + d.score.totalScore, 0) / totalRecords;
    
    // 生成改进建议
    const recommendations: string[] = [];
    const commonIssues = new Map<string, number>();
    
    details.forEach(detail => {
      detail.validationResults.forEach(result => {
        const issue = result.message;
        commonIssues.set(issue, (commonIssues.get(issue) || 0) + 1);
      });
    });
    
    // 按频率排序问题
    const sortedIssues = Array.from(commonIssues.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    sortedIssues.forEach(([issue, count]) => {
      recommendations.push(`${issue} (影响 ${count} 条记录)`);
    });
    
    return {
      summary: {
        totalRecords,
        validRecords,
        errorRecords,
        warningRecords,
        averageScore: Math.round(averageScore * 100) / 100
      },
      details,
      recommendations
    };
  }
}

/**
 * 创建数据验证器实例
 * @param experimentType 实验类型
 * @returns 验证器实例
 */
export function createValidator(experimentType: 'nucleic_extraction' | 'pcr_amplification' | 'library_construction'): DataValidator {
  return new DataValidator(experimentType);
}

/**
 * 快速验证单个值
 * @param value 值
 * @param rules 验证规则
 * @returns 验证结果
 */
export function quickValidate(value: any, rules: {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  type?: 'string' | 'number' | 'email' | 'url';
}): ValidationResult | null {
  // 必填验证
  if (rules.required && (value === undefined || value === null || value === '')) {
    return {
      field: 'value',
      level: ValidationLevel.ERROR,
      message: '此字段为必填项',
      suggestion: '请输入有效值'
    };
  }
  
  // 如果值为空且非必填，则通过验证
  if (value === undefined || value === null || value === '') {
    return null;
  }
  
  // 类型验证
  if (rules.type) {
    switch (rules.type) {
      case 'number':
        if (isNaN(Number(value))) {
          return {
            field: 'value',
            level: ValidationLevel.ERROR,
            message: '必须是有效数字',
            currentValue: value
          };
        }
        break;
      case 'email':
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
          return {
            field: 'value',
            level: ValidationLevel.ERROR,
            message: '邮箱格式不正确',
            currentValue: value
          };
        }
        break;
      case 'url':
        try {
          new URL(value);
        } catch {
          return {
            field: 'value',
            level: ValidationLevel.ERROR,
            message: 'URL格式不正确',
            currentValue: value
          };
        }
        break;
    }
  }
  
  // 数值范围验证
  if (rules.type === 'number' || typeof value === 'number') {
    const numValue = Number(value);
    
    if (rules.min !== undefined && numValue < rules.min) {
      return {
        field: 'value',
        level: ValidationLevel.WARNING,
        message: `值不能小于 ${rules.min}`,
        currentValue: value,
        expectedRange: `≥ ${rules.min}`
      };
    }
    
    if (rules.max !== undefined && numValue > rules.max) {
      return {
        field: 'value',
        level: ValidationLevel.WARNING,
        message: `值不能大于 ${rules.max}`,
        currentValue: value,
        expectedRange: `≤ ${rules.max}`
      };
    }
  }
  
  // 正则表达式验证
  if (rules.pattern && !rules.pattern.test(String(value))) {
    return {
      field: 'value',
      level: ValidationLevel.WARNING,
      message: '格式不符合要求',
      currentValue: value
    };
  }
  
  return null;
}

export default DataValidator;