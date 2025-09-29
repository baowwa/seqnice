/**
 * 实验管理组件
 * 
 * 功能说明：
 * - 重定向到实验任务中心
 * - 提供统一的实验管理入口
 * 
 * @author 系统
 * @version 1.0.0
 */

import React from 'react';
import ExperimentTaskCenter from './ExperimentTaskCenter';

/**
 * 实验管理组件
 */
const ExperimentManagement: React.FC = () => {
  return <ExperimentTaskCenter />;
};

export default ExperimentManagement;