export interface FrameworkPlan {
  projectName: string;

  pages: {
    name: string;
    reason: string;
  }[];

  fixtures: string[];

  utilities: string[];

  testData: string[];

  testScripts: string[];

  reusableComponents: string[];

  businessFlows: string[];
}