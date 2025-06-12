export interface PredictionFactor {
    name: string;
    features: string[];
  }
  
  export interface PredictionInput {
    prediction_factor: string;
    feature_values: Record<string, any>;
  }
  
  export interface PredictionResult {
    prediction: any;
    prediction_column: string;
  }
  
  export interface FeatureImportance {
    features: string[];
    importance_values: number[];
  }
  
  export interface DatasetPreview {
    predictions: any[];
    summary: string;
    columns: string[];
    data: Record<string, any>[];
    full_data: Record<string, any>[];
  }

  export interface PredictionFactor {
    name: string;
    features: string[];
}

  export default interface CorrelationMatrix {
    [key: string]: Record<string, number>;
  }
  
  export interface CorrelationResponse {
    correlation_matrix: CorrelationMatrix;
  }

  
