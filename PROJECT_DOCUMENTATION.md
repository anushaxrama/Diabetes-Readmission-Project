# 🏥 Diabetes Readmission Analysis Portfolio - Complete Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Structure](#architecture--structure)
3. [Backend (Flask API)](#backend-flask-api)
4. [Frontend (Node.js/Express)](#frontend-nodejsexpress)
5. [Data Analysis & Machine Learning](#data-analysis--machine-learning)
6. [Key Features](#key-features)
7. [Setup & Installation](#setup--installation)
8. [API Endpoints](#api-endpoints)
9. [File Structure](#file-structure)
10. [Technologies Used](#technologies-used)
11. [Key Insights & Findings](#key-insights--findings)
12. [Future Enhancements](#future-enhancements)

---

## 🎯 Project Overview

This is a comprehensive **machine learning portfolio project** that analyzes diabetes patient readmission patterns using data from 130 US hospitals (1999-2008). The project combines data science, machine learning, and full-stack web development to create an interactive platform for predicting 30-day hospital readmissions.

### **Core Objectives:**
- Predict 30-day readmission risk for diabetes patients
- Identify key factors driving readmissions
- Create an interactive web application for real-time predictions
- Demonstrate machine learning model performance and interpretability

### **Key Statistics:**
- **Dataset Size**: 101,766 patient encounters
- **Hospitals**: 130 US hospitals
- **Time Period**: 1999-2008
- **Overall Readmission Rate**: 11.16% (11,357 patients)
- **Models**: Logistic Regression & XGBoost

---

## 🏗️ Architecture & Structure

The project follows a **microservices architecture** with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Data Layer    │
│   (Node.js)     │◄──►│   (Flask)       │◄──►│   (CSV Files)   │
│   Port: 3000    │    │   Port: 5002    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Communication Flow:**
1. **User Interface** → Frontend (Node.js/Express)
2. **API Requests** → Backend (Flask)
3. **Data Processing** → Machine Learning Models
4. **Response** → Frontend → User

---

## 🐍 Backend (Flask API)

### **Purpose:**
The Flask backend serves as the **data processing and machine learning engine**, handling all computational tasks and serving data to the frontend.

### **Key Components:**

#### **1. Data Loading & Preprocessing (`load_data()` function)**
```python
# Loads diabetic_data.csv and creates target variable
df['target'] = (df['readmitted'] == '<30').astype(int)

# Feature engineering
feature_cols_num = ['time_in_hospital', 'num_lab_procedures', ...]
feature_cols_cat = ['race', 'gender', 'age', 'admission_type_id', ...]

# Data splitting with GroupShuffleSplit to prevent data leakage
gss = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
```

#### **2. Machine Learning Pipeline**
- **Preprocessing**: OneHotEncoder for categorical variables
- **Models**: Logistic Regression + XGBoost
- **Evaluation**: ROC-AUC and PR-AUC metrics
- **Prediction**: Ensemble averaging of both models

#### **3. API Endpoints:**

| Endpoint | Method | Purpose | Response |
|----------|--------|---------|----------|
| `/api/overview` | GET | Dataset statistics | Patient counts, readmission rates |
| `/api/readmission-rates` | GET | Category-wise rates | Age, gender, race breakdowns |
| `/api/visualizations` | GET | Chart generation | Base64-encoded matplotlib plots |
| `/api/model-performance` | GET | ML metrics | ROC-AUC, PR-AUC scores |
| `/api/predict` | POST | Risk prediction | Probability scores + risk level |
| `/api/health` | GET | Health check | Server status |

#### **4. Visualization Generation**
- **Server-side plotting** using matplotlib/seaborn
- **Base64 encoding** for web transmission
- **Multiple chart types**: Bar charts, line plots, comparison charts

---

## 🟢 Frontend (Node.js/Express)

### **Purpose:**
The frontend provides an **interactive user interface** with modern design, real-time data visualization, and intelligent form handling.

### **Key Components:**

#### **1. Express Server (`server.js`)**
```javascript
// API proxy to Flask backend
app.use('/api', async (req, res) => {
  const response = await axios({
    method: req.method,
    url: `${FLASK_API_URL}${req.originalUrl}`,
    data: req.body
  });
  res.json(response.data);
});
```

#### **2. Interactive Web Interface (`index.html`)**
- **Modern Design**: Gradient backgrounds, glassmorphism effects
- **Responsive Layout**: Mobile-friendly grid system
- **Real-time Loading**: Spinner animations and error handling
- **Smart Forms**: Dynamic field filtering based on medical logic

#### **3. JavaScript Functionality (`app.js`)**
- **API Integration**: Fetch data from Flask backend
- **Chart Rendering**: Display matplotlib plots as images
- **Form Validation**: Client-side validation and data conversion
- **Dynamic Filtering**: Medical logic-based form field filtering

#### **4. Smart Form Features**
The prediction form includes **intelligent filtering** based on medical knowledge:

- **Age-based filtering**: Different admission types for different age groups
- **Medication logic**: Medication counts filtered by age and diagnoses
- **Glucose testing**: A1C/glucose tests filtered by diabetes medication status
- **Visit patterns**: Outpatient/emergency visits filtered by age demographics

---

## 📊 Data Analysis & Machine Learning

### **Dataset Details:**
- **Source**: UCI Machine Learning Repository
- **Size**: 101,766 records × 50+ features
- **Target Variable**: 30-day readmission (`<30` = 1, `>30` or `NO` = 0)
- **Features**: Demographics, medical history, procedures, medications

### **Key Features Used:**
```python
# Numerical features
['time_in_hospital', 'num_lab_procedures', 'num_procedures', 
 'num_medications', 'number_outpatient', 'number_emergency', 
 'number_inpatient', 'number_diagnoses']

# Categorical features  
['race', 'gender', 'age', 'admission_type_id', 
 'discharge_disposition_id', 'admission_source_id', 
 'max_glu_serum', 'A1Cresult', 'change', 'diabetesMed']
```

### **Model Training:**
1. **Data Splitting**: GroupShuffleSplit to prevent patient data leakage
2. **Preprocessing**: OneHotEncoder for categorical variables
3. **Model Training**: 
   - Logistic Regression with class balancing
   - XGBoost with hyperparameter tuning
4. **Evaluation**: ROC-AUC and PR-AUC metrics

### **Model Performance:**
| Model | ROC-AUC | PR-AUC | Notes |
|-------|---------|--------|-------|
| Logistic Regression | 0.6622 | 0.1993 | Baseline model |
| XGBoost | 0.6702 | 0.2101 | Best performing |

---

## ✨ Key Features

### **1. Interactive Dashboard**
- **Real-time Statistics**: Live data loading and display
- **Visual Analytics**: Multiple chart types with smooth animations
- **Responsive Design**: Works on desktop, tablet, and mobile

### **2. Smart Prediction Form**
- **Medical Logic**: Fields filter based on realistic medical scenarios
- **Visual Feedback**: Orange borders indicate filtered fields
- **Comprehensive Input**: All necessary features for accurate predictions
- **Risk Assessment**: Three-tier risk classification (Low/Medium/High)

### **3. Data Visualizations**
- **Demographic Analysis**: Gender, race, age group readmission rates
- **Medical Factors**: Medication counts, length of stay, admission types
- **Model Comparison**: Side-by-side performance metrics
- **Trend Analysis**: Readmission patterns over different variables

### **4. Machine Learning Integration**
- **Ensemble Predictions**: Average of Logistic Regression and XGBoost
- **Real-time Processing**: Instant predictions on form submission
- **Model Interpretability**: Feature importance and performance metrics
- **Confidence Scoring**: Probability-based risk assessment

---

## 🚀 Setup & Installation

### **Prerequisites:**
- Python 3.8+ with pip
- Node.js 14+ with npm
- Git

### **Quick Start:**
```bash
# 1. Clone the repository
git clone <repository-url>
cd Diabetes-Project

# 2. Run the startup script
chmod +x start.sh
./start.sh
```

### **Manual Setup:**

#### **Backend Setup:**
```bash
cd backend
pip install -r requirements.txt
python app.py
```

#### **Frontend Setup:**
```bash
cd frontend
npm install
npm start
```

### **Access Points:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5002
- **Health Check**: http://localhost:3000/health

---

## 🔌 API Endpoints

### **Backend API (Flask - Port 5002)**

#### **GET /api/overview**
Returns dataset overview statistics.
```json
{
  "total_patients": 101766,
  "total_encounters": 101766,
  "readmission_rate": 0.1116,
  "readmission_breakdown": {"<30": 11357, ">30": 35545, "NO": 54864},
  "age_distribution": {...},
  "gender_distribution": {...},
  "race_distribution": {...}
}
```

#### **GET /api/readmission-rates**
Returns readmission rates by different categories.
```json
{
  "age_rates": {"[0-10)": 0.08, "[10-20)": 0.12, ...},
  "gender_rates": {"Female": 0.11, "Male": 0.12},
  "race_rates": {"Caucasian": 0.11, "AfricanAmerican": 0.13, ...},
  "admission_rates": {"Emergency": 0.12, "Elective": 0.08, ...}
}
```

#### **GET /api/visualizations**
Returns base64-encoded visualization charts.
```json
{
  "gender_race": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "medications": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "length_of_stay": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "admission_type": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

#### **GET /api/model-performance**
Returns machine learning model performance metrics.
```json
{
  "logistic_regression": {"roc_auc": 0.6622, "pr_auc": 0.1993},
  "xgboost": {"roc_auc": 0.6702, "pr_auc": 0.2101},
  "performance_chart": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

#### **POST /api/predict**
Predicts readmission risk for a new patient.
```json
// Request
{
  "age": "[50-60)",
  "gender": "Female",
  "race": "Caucasian",
  "time_in_hospital": 5,
  "num_medications": 8,
  // ... other features
}

// Response
{
  "logistic_regression_probability": 0.1234,
  "xgboost_probability": 0.1456,
  "average_probability": 0.1345,
  "risk_level": "Low"
}
```

---

## 📁 File Structure

```
Diabetes-Project/
├── 📊 Data Files
│   ├── diabetic_data.csv          # Main dataset (101,766 records)
│   └── IDS_mapping.csv           # ID mapping reference
│
├── 🐍 Backend (Flask)
│   ├── app.py                    # Main Flask application
│   ├── requirements.txt          # Python dependencies
│   ├── models/                   # Trained model files
│   │   ├── logistic_regression.pkl
│   │   ├── xgboost.pkl
│   │   └── feature_columns.pkl
│   ├── preprocessor.pkl          # Data preprocessing pipeline
│   └── venv/                     # Python virtual environment
│
├── 🟢 Frontend (Node.js)
│   ├── server.js                 # Express server
│   ├── package.json              # Node.js dependencies
│   ├── public/
│   │   ├── index.html            # Main HTML page
│   │   └── app.js               # Frontend JavaScript
│   ├── dist/                     # Webpack build output
│   └── node_modules/             # Node.js dependencies
│
├── 📓 Jupyter Notebooks
│   ├── Diabetes_Readmission_Portfolio.ipynb  # Main analysis notebook
│   └── zs_diabetes_project (2).ipynb        # Additional analysis
│
├── 🚀 Scripts
│   ├── start.sh                  # Startup script
│   └── requirements.txt          # Root requirements
│
└── 📚 Documentation
    ├── README.md                 # Project overview
    └── PROJECT_DOCUMENTATION.md  # This file
```

---

## 🛠️ Technologies Used

### **Backend Technologies:**
- **Flask 2.3.3**: Web framework
- **Pandas 2.3.2**: Data manipulation
- **NumPy 2.2.6**: Numerical computing
- **Scikit-learn 1.7.1**: Machine learning
- **XGBoost 3.0.5**: Gradient boosting
- **Matplotlib 3.10.6**: Data visualization
- **Seaborn 0.13.2**: Statistical visualization
- **Joblib 1.5.2**: Model serialization

### **Frontend Technologies:**
- **Node.js**: Runtime environment
- **Express 4.18.2**: Web framework
- **HTML5/CSS3**: Modern web standards
- **JavaScript (ES6+)**: Frontend logic
- **Chart.js 4.4.0**: Data visualization
- **Axios 1.6.0**: HTTP client
- **Font Awesome**: Icons
- **Google Fonts**: Typography

### **Development Tools:**
- **Webpack 5.89.0**: Module bundler
- **Nodemon 3.0.1**: Development server
- **CORS**: Cross-origin resource sharing
- **Git**: Version control

---

## 📈 Key Insights & Findings

### **1. Demographic Patterns**
- **Age Groups**: 20-30 age group has highest readmission rate (14.24%)
- **Gender**: Slight differences between male (12.1%) and female (11.0%)
- **Race**: African American patients show higher readmission rates (13.2%)

### **2. Medical Factors**
- **Medications**: Higher medication count correlates with increased risk
- **Length of Stay**: Longer stays generally associated with higher readmission rates
- **Admission Type**: Emergency admissions show different patterns than elective
- **Procedures**: More procedures often indicate higher complexity and risk

### **3. Model Performance**
- **XGBoost** slightly outperforms Logistic Regression
- **Ensemble approach** provides more stable predictions
- **Feature importance** reveals key risk factors

### **4. Clinical Implications**
- **Early identification** of high-risk patients is possible
- **Intervention strategies** can be targeted based on risk factors
- **Resource allocation** can be optimized using prediction models

---

## 🔮 Future Enhancements

### **Short-term Improvements:**
- [ ] **SHAP Integration**: Add feature importance analysis
- [ ] **Real-time Updates**: Implement data refresh capabilities
- [ ] **More Visualizations**: Add additional chart types
- [ ] **Export Features**: Allow data export in various formats

### **Medium-term Features:**
- [ ] **Model Retraining**: Automated model retraining pipeline
- [ ] **User Authentication**: Secure access and user management
- [ ] **API Documentation**: Swagger/OpenAPI documentation
- [ ] **Database Integration**: Replace CSV with proper database

### **Long-term Vision:**
- [ ] **Real-time Data**: Integration with hospital systems
- [ ] **Mobile App**: Native mobile application
- [ ] **Advanced ML**: Deep learning models and neural networks
- [ ] **Clinical Integration**: EHR system integration

---

## 🎯 Conclusion

This Diabetes Readmission Analysis Portfolio demonstrates a **complete end-to-end machine learning project** that combines:

- **Data Science**: Comprehensive analysis of healthcare data
- **Machine Learning**: Multiple algorithms with proper evaluation
- **Web Development**: Modern, responsive user interface
- **API Design**: RESTful services with proper error handling
- **User Experience**: Intuitive interface with smart form logic

The project serves as an excellent **portfolio piece** showcasing skills in:
- Python data science stack
- JavaScript/Node.js development
- Machine learning model deployment
- Full-stack web application development
- Healthcare data analysis

---

**Built with ❤️ for data science and machine learning education**

*This documentation provides a comprehensive overview of the entire project. Each component is designed to work together seamlessly, creating a professional-grade machine learning application suitable for both educational and portfolio purposes.*
