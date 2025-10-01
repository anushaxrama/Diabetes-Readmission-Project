from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
import base64
import io
from sklearn.model_selection import GroupShuffleSplit
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, average_precision_score
from xgboost import XGBClassifier
import joblib
import os

app = Flask(__name__)
CORS(app)

# Global variables to store data and models
df = None
train = None
valid = None
logit_model = None
xgb_model = None
preprocessor = None

def load_data():
    """Load and preprocess the diabetes dataset"""
    global df, train, valid, logit_model, xgb_model, preprocessor
    
    # Load data
    df = pd.read_csv('../diabetic_data.csv')
    df['target'] = (df['readmitted'] == '<30').astype(int)
    
    # Prepare features
    feature_cols_num = [
        'time_in_hospital', 'num_lab_procedures', 'num_procedures', 'num_medications',
        'number_outpatient', 'number_emergency', 'number_inpatient', 'number_diagnoses'
    ]
    feature_cols_cat = [
        'race', 'gender', 'age', 'admission_type_id', 'discharge_disposition_id',
        'admission_source_id', 'max_glu_serum', 'A1Cresult', 'change', 'diabetesMed'
    ]
    
    # Split data
    patients = df['patient_nbr'].unique()
    gss = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
    train_idx, valid_idx = next(gss.split(df, groups=df['patient_nbr']))
    
    train = df.iloc[train_idx].copy()
    valid = df.iloc[valid_idx].copy()
    
    # Create preprocessor
    preprocessor = ColumnTransformer([
        ('cat', OneHotEncoder(handle_unknown='ignore'), feature_cols_cat),
        ('num', 'passthrough', feature_cols_num)
    ])
    
    # Prepare training data
    X_train = train[feature_cols_num + feature_cols_cat]
    y_train = train['target']
    X_valid = valid[feature_cols_num + feature_cols_cat]
    y_valid = valid['target']
    
    # Train models
    logit_model = Pipeline(steps=[
        ('prep', preprocessor),
        ('clf', LogisticRegression(max_iter=1000, class_weight='balanced', random_state=42))
    ])
    
    xgb_model = Pipeline(steps=[
        ('prep', preprocessor),
        ('clf', XGBClassifier(
            n_estimators=300, max_depth=4, learning_rate=0.05,
            subsample=0.9, colsample_bytree=0.9,
            random_state=42, eval_metric='logloss'
        ))
    ])
    
    # Fit models
    logit_model.fit(X_train, y_train)
    xgb_model.fit(X_train, y_train)
    
    print("Data loaded and models trained successfully!")

def create_plot_base64(fig):
    """Convert matplotlib figure to base64 string"""
    img_buffer = io.BytesIO()
    fig.savefig(img_buffer, format='png', dpi=100, bbox_inches='tight')
    img_buffer.seek(0)
    img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
    plt.close(fig)
    return img_base64

@app.route('/api/overview', methods=['GET'])
def get_overview():
    """Get dataset overview statistics"""
    if df is None:
        load_data()
    
    total_patients = len(df)
    total_encounters = len(df)
    readmission_rate = df['target'].mean()
    
    # Readmission breakdown
    readmission_counts = df['readmitted'].value_counts()
    
    # Age distribution
    age_dist = df['age'].value_counts().sort_index()
    
    # Gender distribution
    gender_dist = df['gender'].value_counts()
    
    # Race distribution
    race_dist = df['race'].value_counts()
    
    return jsonify({
        'total_patients': total_patients,
        'total_encounters': total_encounters,
        'readmission_rate': round(readmission_rate, 4),
        'readmission_breakdown': readmission_counts.to_dict(),
        'age_distribution': age_dist.to_dict(),
        'gender_distribution': gender_dist.to_dict(),
        'race_distribution': race_dist.to_dict()
    })

@app.route('/api/readmission-rates', methods=['GET'])
def get_readmission_rates():
    """Get readmission rates by different categories"""
    if df is None:
        load_data()
    
    # Age readmission rates
    age_rates = df.groupby('age')['target'].mean().sort_index()
    
    # Gender readmission rates
    gender_rates = df.groupby('gender')['target'].mean()
    
    # Race readmission rates
    race_rates = df.groupby('race')['target'].mean()
    
    # Admission type readmission rates
    admission_labels = {
        1: "Emergency", 2: "Urgent", 3: "Elective", 4: "Newborn",
        5: "Not Available", 6: "NULL", 7: "Trauma Center", 8: "Not Mapped"
    }
    admission_rates = df.groupby('admission_type_id')['target'].mean()
    admission_rates_labeled = {admission_labels.get(k, f"Type {k}"): v for k, v in admission_rates.items()}
    
    # Medications readmission rates (subset for visualization)
    med_rates = df[df['num_medications'] < 40].groupby('num_medications')['target'].mean()
    
    # Length of stay readmission rates
    stay_rates = df.groupby('time_in_hospital')['target'].mean()
    
    return jsonify({
        'age_rates': age_rates.to_dict(),
        'gender_rates': gender_rates.to_dict(),
        'race_rates': race_rates.to_dict(),
        'admission_rates': admission_rates_labeled,
        'medication_rates': med_rates.to_dict(),
        'stay_rates': stay_rates.to_dict()
    })

@app.route('/api/visualizations', methods=['GET'])
def get_visualizations():
    """Generate and return visualization charts"""
    if df is None:
        load_data()
    
    visualizations = {}
    
    # 1. Gender and Race readmission rates
    fig, axes = plt.subplots(1, 2, figsize=(12, 5))
    
    gender_rates = df.groupby('gender')['target'].mean().sort_values()
    race_rates = df.groupby('race')['target'].mean().sort_values()
    
    gender_rates.plot(kind='bar', ax=axes[0], color='skyblue')
    axes[0].set_title("Readmission % by Gender")
    axes[0].set_ylabel("Proportion Readmitted (<30 days)")
    axes[0].tick_params(axis='x', rotation=45)
    
    race_rates.plot(kind='bar', ax=axes[1], color='salmon')
    axes[1].set_title("Readmission % by Race")
    axes[1].set_ylabel("Proportion Readmitted (<30 days)")
    axes[1].tick_params(axis='x', rotation=45)
    
    plt.tight_layout()
    visualizations['gender_race'] = create_plot_base64(fig)
    
    # 2. Medications vs Readmission
    fig, ax = plt.subplots(figsize=(10, 5))
    subset = df[df['num_medications'] < 40]
    med_readmit = subset.groupby('num_medications')['target'].mean()
    med_readmit.plot(kind='line', marker='o', color='darkblue', ax=ax)
    ax.set_title("Readmission % by Number of Medications")
    ax.set_xlabel("Number of Medications")
    ax.set_ylabel("Proportion Readmitted (<30 days)")
    ax.grid(True)
    visualizations['medications'] = create_plot_base64(fig)
    
    # 3. Length of Stay vs Readmission
    fig, ax = plt.subplots(figsize=(8, 5))
    stay_readmit = df.groupby('time_in_hospital')['target'].mean()
    stay_readmit.plot(kind='bar', color='teal', ax=ax)
    ax.set_title("Readmission % by Length of Hospital Stay")
    ax.set_xlabel("Days in Hospital")
    ax.set_ylabel("Proportion Readmitted (<30 days)")
    visualizations['length_of_stay'] = create_plot_base64(fig)
    
    # 4. Admission Type vs Readmission
    fig, ax = plt.subplots(figsize=(9, 5))
    admission_labels = {
        1: "Emergency", 2: "Urgent", 3: "Elective", 4: "Newborn",
        5: "Not Available", 6: "NULL", 7: "Trauma Center", 8: "Not Mapped"
    }
    admission_readmit = df.groupby("admission_type_id")["target"].mean().reset_index()
    admission_readmit["Label"] = admission_readmit["admission_type_id"].map(admission_labels)
    
    ax.bar(admission_readmit["Label"], admission_readmit["target"], color="steelblue")
    ax.set_title("Readmission % by Admission Type")
    ax.set_ylabel("Proportion Readmitted (<30 days)")
    ax.tick_params(axis='x', rotation=45)
    visualizations['admission_type'] = create_plot_base64(fig)
    
    return jsonify(visualizations)

@app.route('/api/model-performance', methods=['GET'])
def get_model_performance():
    """Get machine learning model performance metrics"""
    if df is None or logit_model is None or xgb_model is None:
        load_data()
    
    # Prepare validation data
    feature_cols_num = [
        'time_in_hospital', 'num_lab_procedures', 'num_procedures', 'num_medications',
        'number_outpatient', 'number_emergency', 'number_inpatient', 'number_diagnoses'
    ]
    feature_cols_cat = [
        'race', 'gender', 'age', 'admission_type_id', 'discharge_disposition_id',
        'admission_source_id', 'max_glu_serum', 'A1Cresult', 'change', 'diabetesMed'
    ]
    
    X_valid = valid[feature_cols_num + feature_cols_cat]
    y_valid = valid['target']
    
    # Get predictions
    p_valid_logit = logit_model.predict_proba(X_valid)[:, 1]
    p_valid_xgb = xgb_model.predict_proba(X_valid)[:, 1]
    
    # Calculate metrics
    logit_roc = roc_auc_score(y_valid, p_valid_logit)
    logit_pr = average_precision_score(y_valid, p_valid_logit)
    xgb_roc = roc_auc_score(y_valid, p_valid_xgb)
    xgb_pr = average_precision_score(y_valid, p_valid_xgb)
    
    # Create performance comparison chart
    fig, ax = plt.subplots(figsize=(8, 6))
    models = ['Logistic Regression', 'XGBoost']
    roc_scores = [logit_roc, xgb_roc]
    pr_scores = [logit_pr, xgb_pr]
    
    x = np.arange(len(models))
    width = 0.35
    
    ax.bar(x - width/2, roc_scores, width, label='ROC-AUC', color='skyblue')
    ax.bar(x + width/2, pr_scores, width, label='PR-AUC', color='steelblue')
    
    ax.set_xlabel('Models')
    ax.set_ylabel('Score')
    ax.set_title('Model Performance Comparison')
    ax.set_xticks(x)
    ax.set_xticklabels(models)
    ax.legend()
    ax.set_ylim(0, 1)
    
    performance_chart = create_plot_base64(fig)
    
    return jsonify({
        'logistic_regression': {
            'roc_auc': round(logit_roc, 4),
            'pr_auc': round(logit_pr, 4)
        },
        'xgboost': {
            'roc_auc': round(xgb_roc, 4),
            'pr_auc': round(xgb_pr, 4)
        },
        'performance_chart': performance_chart
    })

@app.route('/api/predict', methods=['POST'])
def predict_readmission():
    """Predict readmission risk for a new patient"""
    if df is None or logit_model is None or xgb_model is None:
        load_data()
    
    data = request.get_json()
    
    # Create a DataFrame with the input data
    patient_data = pd.DataFrame([data])
    
    # Get predictions from both models
    logit_prob = logit_model.predict_proba(patient_data)[0, 1]
    xgb_prob = xgb_model.predict_proba(patient_data)[0, 1]
    
    # Average the predictions
    avg_prob = (logit_prob + xgb_prob) / 2
    
    # Ensure JSON-serializable native Python floats
    return jsonify({
        'logistic_regression_probability': float(round(float(logit_prob), 4)),
        'xgboost_probability': float(round(float(xgb_prob), 4)),
        'average_probability': float(round(float(avg_prob), 4)),
        'risk_level': 'High' if float(avg_prob) > 0.3 else 'Medium' if float(avg_prob) > 0.15 else 'Low'
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Diabetes Readmission API is running'})

if __name__ == '__main__':
    print("Loading data and training models...")
    load_data()
    print("Starting Flask server...")
    app.run(debug=True, host='0.0.0.0', port=5002)
