# Diabetes Readmission Analysis Portfolio

A comprehensive web application showcasing machine learning analysis of diabetes patient readmissions using Flask backend and Node.js frontend.

##  Project Overview

This portfolio demonstrates:
- **Data Analysis**: 101,766 diabetes patient encounters from 130 US hospitals (1999-2008)
- **Machine Learning**: Logistic Regression and XGBoost models for readmission prediction
- **Visualization**: Interactive charts and data insights
- **Web Application**: Modern, responsive UI with prediction capabilities

## Features

### Backend (Flask)
- RESTful API endpoints for data analysis
- Machine learning model training and prediction
- Data visualization generation
- CORS-enabled for frontend integration

### Frontend (Node.js + Express)
- Modern, responsive design
- Interactive data visualizations
- Real-time readmission risk prediction
- Mobile-friendly interface

##  Key Insights

- **Overall Readmission Rate**: 11.16% (11,357 out of 101,766 patients)
- **Model Performance**: XGBoost achieves 67.02% ROC-AUC vs 66.22% for Logistic Regression
- **Key Risk Factors**: Age, number of medications, length of stay, admission type

## 🛠️ Setup Instructions

### Prerequisites
- Python 3.8+ with pip
- Node.js 14+ with npm
- Git

### Backend Setup (Flask)

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Ensure CSV files are in parent directory:**
   - `diabetic_data.csv`
   - `IDS_mapping.csv`

4. **Start Flask server:**
   ```bash
   python app.py
   ```
   Server will run on `http://localhost:5000`

### Frontend Setup (Node.js)

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Start Express server:**
   ```bash
   npm start
   ```
   Server will run on `http://localhost:3000`

### Running Both Services

1. **Terminal 1 - Start Flask backend:**
   ```bash
   cd backend
   python app.py
   ```

2. **Terminal 2 - Start Node.js frontend:**
   ```bash
   cd frontend
   npm start
   ```

3. **Open browser:**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
diabetes-readmission-portfolio/
├── backend/
│   ├── app.py                 # Flask application
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── server.js             # Express server
│   ├── package.json          # Node.js dependencies
│   └── public/
│       ├── index.html        # Main HTML page
│       └── app.js           # Frontend JavaScript
├── diabetic_data.csv         # Main dataset
├── IDS_mapping.csv          # ID mapping file
└── README.md                # This file
```

## 🔌 API Endpoints

### Backend API (Flask - Port 5000)

- `GET /api/overview` - Dataset overview statistics
- `GET /api/readmission-rates` - Readmission rates by category
- `GET /api/visualizations` - Generated visualization charts
- `GET /api/model-performance` - Model performance metrics
- `POST /api/predict` - Predict readmission risk
- `GET /api/health` - Health check

### Frontend API (Node.js - Port 3000)

- `GET /` - Main portfolio page
- `GET /health` - Frontend health check
- `GET /api/*` - Proxies to Flask backend

##  Technologies Used

### Backend
- **Flask**: Web framework
- **Pandas**: Data manipulation
- **NumPy**: Numerical computing
- **Scikit-learn**: Machine learning
- **XGBoost**: Gradient boosting
- **Matplotlib/Seaborn**: Data visualization

### Frontend
- **Node.js**: Runtime environment
- **Express**: Web framework
- **Chart.js**: Data visualization
- **HTML5/CSS3**: Modern web standards
- **JavaScript (ES6+)**: Frontend logic

## 📈 Model Performance

| Model | ROC-AUC | PR-AUC |
|-------|---------|--------|
| Logistic Regression | 0.6622 | 0.1993 |
| XGBoost | 0.6702 | 0.2101 |

## 🔍 Key Findings

1. **Age Groups**: 20-30 age group has highest readmission rate (14.2%)
2. **Gender**: Slight differences in readmission rates between genders
3. **Medications**: Higher medication count correlates with increased readmission risk
4. **Length of Stay**: Longer stays generally associated with higher readmission rates
5. **Admission Type**: Emergency admissions show different patterns than elective

##  Future Enhancements

- [ ] Add SHAP feature importance analysis
- [ ] Implement real-time data updates
- [ ] Add more visualization types
- [ ] Include model retraining capabilities
- [ ] Add user authentication
- [ ] Implement data export features

## 📝 Notes

- The application loads and trains models on startup (may take a few minutes)
- All visualizations are generated server-side and sent as base64 images
- The prediction form includes all necessary features for accurate predictions
- CORS is enabled for development; configure appropriately for production

##  Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for data science and machine learning education**
