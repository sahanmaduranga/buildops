import { Resource, RateAnalysis } from '../types.ts';
import { MOCK_RESOURCES, MOCK_RATE_ANALYSES } from '../mockData.ts';

/**
 * Gets the current Company Master Resource records from localStorage or defaults
 */
export const getGlobalResources = (): Resource[] => {
  const saved = localStorage.getItem('buildops_global_resources');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  return MOCK_RESOURCES;
};

/**
 * Gets the current Company Master Rate Analysis records from localStorage or defaults
 */
export const getGlobalAnalyses = (): RateAnalysis[] => {
  const saved = localStorage.getItem('buildops_global_analyses');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  return MOCK_RATE_ANALYSES;
};

export interface ResourceImportOptions {
  projectId: string;
  importMode: 'all' | 'categories' | 'specific';
  selectedCategories?: string[];
  selectedSpecificResources?: string[];
  importPrices: boolean;
  conflictStrategy: 'skip' | 'update' | 'duplicate' | 'rename';
}

export interface AnalysisImportOptions {
  projectId: string;
  importMode: 'all' | 'groups' | 'specific';
  selectedGroups?: string[];
  selectedSpecificAnalyses?: string[];
  conflictStrategy: 'skip' | 'update' | 'duplicate' | 'rename';
}

export interface ImportStats {
  importedCount: number;
  skippedCount: number;
  duplicateCount: number;
  renamedCount: number;
  categoriesCount: number;
  groupsCount: number;
  subGroupsCount: number;
  pricesCount: number;
  warnings: string[];
}

/**
 * Executes standard copy and dependencies resolution logic to import resources into a project
 */
export const executeResourceImport = (
  options: ResourceImportOptions,
  existingResources: Resource[] = []
): { updatedResources: Resource[]; stats: ImportStats } => {
  const globalRes = getGlobalResources();
  let toImport: Resource[] = [];

  // Filter based on selected modes
  if (options.importMode === 'all') {
    toImport = [...globalRes];
  } else if (options.importMode === 'categories' && options.selectedCategories) {
    toImport = globalRes.filter(r => options.selectedCategories?.includes(r.category));
  } else if (options.importMode === 'specific' && options.selectedSpecificResources) {
    toImport = globalRes.filter(r => options.selectedSpecificResources?.includes(r.id));
  }

  const updatedResources = [...existingResources];
  const stats: ImportStats = {
    importedCount: 0,
    skippedCount: 0,
    duplicateCount: 0,
    renamedCount: 0,
    categoriesCount: 0,
    groupsCount: 0,
    subGroupsCount: 0,
    pricesCount: 0,
    warnings: [],
  };

  const categoriesSet = new Set<string>();
  const groupsSet = new Set<string>();
  const subGroupsSet = new Set<string>();

  toImport.forEach(res => {
    // Collect stats details for automatic dependencies
    if (res.category) categoriesSet.add(res.category);
    if (res.resourceGroup) groupsSet.add(res.resourceGroup);
    if (res.resourceSubGroup) subGroupsSet.add(res.resourceSubGroup);

    const matchIdx = updatedResources.findIndex(r => r.code.toLowerCase() === res.code.toLowerCase());

    if (matchIdx === -1) {
      // Direct Import
      updatedResources.push({
        ...res,
        lastUpdated: new Date().toISOString().split('T')[0],
      });
      stats.importedCount++;
      if (options.importPrices) stats.pricesCount++;
    } else {
      // Conflict strategy
      const existing = updatedResources[matchIdx];
      switch (options.conflictStrategy) {
        case 'skip':
          stats.skippedCount++;
          break;

        case 'update':
          updatedResources[matchIdx] = {
            ...res,
            id: existing.id, // Preserve project-specific internal identifier
            lastUpdated: new Date().toISOString().split('T')[0],
          };
          stats.importedCount++;
          if (options.importPrices) stats.pricesCount++;
          break;

        case 'duplicate':
          updatedResources.push({
            ...res,
            id: `res-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            code: `${res.code}-COPY`,
            name: `${res.name} (Copy)`,
            lastUpdated: new Date().toISOString().split('T')[0],
          });
          stats.duplicateCount++;
          if (options.importPrices) stats.pricesCount++;
          break;

        case 'rename':
          updatedResources.push({
            ...res,
            id: `res-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            code: `${res.code}_AUTO_${Math.floor(100 + Math.random() * 900)}`,
            name: `${res.name} (Auto Renamed)`,
            lastUpdated: new Date().toISOString().split('T')[0],
          });
          stats.renamedCount++;
          if (options.importPrices) stats.pricesCount++;
          break;
      }
    }
  });

  stats.categoriesCount = categoriesSet.size;
  stats.groupsCount = groupsSet.size;
  stats.subGroupsCount = subGroupsSet.size;

  // Simulate warning check
  toImport.forEach(res => {
    if (!res.supplier) {
      stats.warnings.push(`Missing Supplier Reference: For resource [${res.code}] ${res.name}. Falling back to default.`);
    }
  });

  return { updatedResources, stats };
};

/**
 * Executes copy and auto resolve dependent resources logic to import rate analyses into a project
 */
export const executeAnalysisImport = (
  options: AnalysisImportOptions,
  existingResources: Resource[],
  existingAnalyses: RateAnalysis[] = []
): { updatedAnalyses: RateAnalysis[]; resolvedResources: Resource[]; stats: ImportStats } => {
  const globalAnalyses = getGlobalAnalyses();
  const globalRes = getGlobalResources();
  let toImport: RateAnalysis[] = [];

  // Filter based on selected modes
  if (options.importMode === 'all') {
    toImport = [...globalAnalyses];
  } else if (options.importMode === 'groups' && options.selectedGroups) {
    toImport = globalAnalyses.filter(a => options.selectedGroups?.includes(a.categoryId || ''));
  } else if (options.importMode === 'specific' && options.selectedSpecificAnalyses) {
    toImport = globalAnalyses.filter(a => options.selectedSpecificAnalyses?.includes(a.id));
  }

  const updatedAnalyses = [...existingAnalyses];
  const resolvedResources = [...existingResources];

  const stats: ImportStats = {
    importedCount: 0,
    skippedCount: 0,
    duplicateCount: 0,
    renamedCount: 0,
    categoriesCount: 0,
    groupsCount: 0,
    subGroupsCount: 0,
    pricesCount: 0,
    warnings: [],
  };

  toImport.forEach(analysis => {
    // 1. Resolve Dependencies automatically!
    // For each resource listed in the rate analysis, ensure it exists in the project's resources registry
    analysis.resources.forEach(linkedRes => {
      const existsInProj = resolvedResources.some(
        r => r.id === linkedRes.resourceId
      );

      if (!existsInProj) {
        // Find in global resource catalog
        const matchGlobal = globalRes.find(
          rg => rg.id === linkedRes.resourceId
        );

        if (matchGlobal) {
          resolvedResources.push({
            ...matchGlobal,
            lastUpdated: new Date().toISOString().split('T')[0],
          });
        } else {
          // If we can't find it, we fabricate a simple dummy resource so it doesn't crash the calculation engine!
          resolvedResources.push({
            id: linkedRes.resourceId,
            code: linkedRes.resourceId,
            name: linkedRes.resourceName,
            type: linkedRes.resourceType,
            category: 'Materials Secondary',
            unit: 'Nos',
            baseRate: linkedRes.rate,
            currency: 'USD',
            supplier: 'Auto Sourced Placer',
            lastUpdated: new Date().toISOString().split('T')[0],
          });
          stats.warnings.push(`Dependency Caution: Linked resource ID [${linkedRes.resourceId}] was absent from master library. Auto-created placeholder.`);
        }
      }
    });

    // 2. Import analyzing duplicates and conflicts
    const matchIdx = updatedAnalyses.findIndex(a => a.code.toLowerCase() === analysis.code.toLowerCase());

    if (matchIdx === -1) {
      updatedAnalyses.push({
        ...analysis,
      });
      stats.importedCount++;
    } else {
      const existing = updatedAnalyses[matchIdx];
      switch (options.conflictStrategy) {
        case 'skip':
          stats.skippedCount++;
          break;

        case 'update':
          updatedAnalyses[matchIdx] = {
            ...analysis,
            id: existing.id,
          };
          stats.importedCount++;
          break;

        case 'duplicate':
          updatedAnalyses.push({
            ...analysis,
            id: `ra-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            code: `${analysis.code}-COPY`,
            description: `${analysis.description} (Copy)`,
          });
          stats.duplicateCount++;
          break;

        case 'rename':
          updatedAnalyses.push({
            ...analysis,
            id: `ra-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            code: `${analysis.code}_AUTO_${Math.floor(100 + Math.random() * 900)}`,
            description: `${analysis.description} (Auto Renamed)`,
          });
          stats.renamedCount++;
          break;
      }
    }
  });

  return { updatedAnalyses, resolvedResources, stats };
};
