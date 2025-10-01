// API Configuration
const API_BASE_URL = '/api';

// Chart.js configuration
Chart.defaults.font.family = 'Inter, sans-serif';
Chart.defaults.color = '#666';

// Utility functions
function showLoading(elementId) {
    document.getElementById(elementId).style.display = 'block';
}

function hideLoading(elementId) {
    document.getElementById(elementId).style.display = 'none';
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function hideError(elementId) {
    document.getElementById(elementId).style.display = 'none';
}

function showContent(elementId) {
    document.getElementById(elementId).style.display = 'block';
}

// API calls
async function fetchData(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Load overview data
async function loadOverview() {
    try {
        showLoading('overview-loading');
        hideError('overview-error');
        
        const data = await fetchData('/overview');
        
        // Update stats cards
        const statsContainer = document.getElementById('overview-stats');
        statsContainer.innerHTML = `
            <div class="stat-card">
                <h3>${data.total_patients.toLocaleString()}</h3>
                <p>Total Patients</p>
            </div>
            <div class="stat-card">
                <h3>${data.total_encounters.toLocaleString()}</h3>
                <p>Total Encounters</p>
            </div>
            <div class="stat-card">
                <h3>${(data.readmission_rate * 100).toFixed(1)}%</h3>
                <p>Readmission Rate</p>
            </div>
            <div class="stat-card">
                <h3>${data.readmission_breakdown['<30'].toLocaleString()}</h3>
                <p>Early Readmissions</p>
            </div>
        `;
        
        hideLoading('overview-loading');
        showContent('overview-content');
    } catch (error) {
        hideLoading('overview-loading');
        showError('overview-error', `Failed to load overview data: ${error.message}`);
    }
}

// Load visualizations
async function loadVisualizations() {
    try {
        showLoading('viz-loading');
        hideError('viz-error');
        
        const data = await fetchData('/visualizations');
        
        // Create charts from base64 images
        createImageChart('gender-race-chart', data.gender_race);
        createImageChart('medications-chart', data.medications);
        createImageChart('length-of-stay-chart', data.length_of_stay);
        createImageChart('admission-type-chart', data.admission_type);
        
        hideLoading('viz-loading');
        showContent('visualizations-content');
    } catch (error) {
        hideLoading('viz-loading');
        showError('viz-error', `Failed to load visualizations: ${error.message}`);
    }
}

// Create chart from base64 image
function createImageChart(canvasId, base64Data) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
    };
    img.src = `data:image/png;base64,${base64Data}`;
}

// Load model performance
async function loadModelPerformance() {
    try {
        showLoading('model-loading');
        hideError('model-error');
        
        const data = await fetchData('/model-performance');
        
        // Update model cards
        const modelCardsContainer = document.getElementById('model-cards');
        modelCardsContainer.innerHTML = `
            <div class="model-card">
                <h4>Logistic Regression</h4>
                <div class="metric">
                    <span class="metric-label">ROC-AUC</span>
                    <span class="metric-value">${data.logistic_regression.roc_auc}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">PR-AUC</span>
                    <span class="metric-value">${data.logistic_regression.pr_auc}</span>
                </div>
            </div>
            <div class="model-card">
                <h4>XGBoost</h4>
                <div class="metric">
                    <span class="metric-label">ROC-AUC</span>
                    <span class="metric-value">${data.xgboost.roc_auc}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">PR-AUC</span>
                    <span class="metric-value">${data.xgboost.pr_auc}</span>
                </div>
            </div>
        `;
        
        // Create performance comparison chart
        createImageChart('performance-chart', data.performance_chart);
        
        hideLoading('model-loading');
        showContent('model-content');
    } catch (error) {
        hideLoading('model-loading');
        showError('model-error', `Failed to load model performance: ${error.message}`);
    }
}

// Handle prediction form submission
document.getElementById('prediction-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const patientData = {};
    
    // Convert form data to object
    for (let [key, value] of formData.entries()) {
        patientData[key] = value;
    }
    
    // Convert numeric fields
    patientData.time_in_hospital = parseInt(patientData.time_in_hospital);
    patientData.num_medications = parseInt(patientData.num_medications);
    patientData.num_lab_procedures = parseInt(patientData.num_lab_procedures);
    patientData.num_procedures = parseInt(patientData.num_procedures);
    patientData.number_diagnoses = parseInt(patientData.number_diagnoses);
    patientData.admission_type_id = parseInt(patientData.admission_type_id);
    patientData.discharge_disposition_id = parseInt(patientData.discharge_disposition_id);
    patientData.admission_source_id = parseInt(patientData.admission_source_id);
    patientData.number_outpatient = parseInt(patientData.number_outpatient);
    patientData.number_emergency = parseInt(patientData.number_emergency);
    patientData.number_inpatient = parseInt(patientData.number_inpatient);
    
    try {
        const response = await fetch(`${API_BASE_URL}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(patientData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        displayPredictionResult(result);
        
    } catch (error) {
        console.error('Prediction Error:', error);
        alert(`Failed to make prediction: ${error.message}`);
    }
});

// Display prediction result
function displayPredictionResult(result) {
    const resultContainer = document.getElementById('prediction-result');
    
    const riskClass = result.risk_level.toLowerCase().replace(' ', '-');
    const riskColor = {
        'high': '#c62828',
        'medium': '#ef6c00',
        'low': '#2e7d32'
    }[result.risk_level.toLowerCase()];
    
    resultContainer.innerHTML = `
        <div class="prediction-result ${riskClass}-risk">
            <h3>Prediction Result</h3>
            <div style="font-size: 2rem; margin: 1rem 0; font-weight: 700;">
                ${(result.average_probability * 100).toFixed(1)}% Risk
            </div>
            <p><strong>Risk Level:</strong> ${result.risk_level}</p>
            <div style="margin-top: 1rem; font-size: 0.9rem; opacity: 0.8;">
                <p>Logistic Regression: ${(result.logistic_regression_probability * 100).toFixed(1)}%</p>
                <p>XGBoost: ${(result.xgboost_probability * 100).toFixed(1)}%</p>
            </div>
        </div>
    `;
    
    resultContainer.style.display = 'block';
    resultContainer.scrollIntoView({ behavior: 'smooth' });
}

// Dynamic form filtering functions
function setupDynamicFiltering() {
    // Age-based filtering
    const ageSelect = document.getElementById('age');
    const admissionTypeSelect = document.getElementById('admission_type_id');
    const dischargeDispositionSelect = document.getElementById('discharge_disposition_id');
    const admissionSourceSelect = document.getElementById('admission_source_id');
    
    // Admission type options based on age
    const admissionTypeOptions = {
        '[0-10)': ['4', '5', '6', '7', '8'], // Newborn, Not Available, NULL, Trauma Center, Not Mapped
        '[10-20)': ['1', '2', '3', '5', '6', '7', '8'], // All except Newborn
        '[20-30)': ['1', '2', '3', '5', '6', '7', '8'],
        '[30-40)': ['1', '2', '3', '5', '6', '7', '8'],
        '[40-50)': ['1', '2', '3', '5', '6', '7', '8'],
        '[50-60)': ['1', '2', '3', '5', '6', '7', '8'],
        '[60-70)': ['1', '2', '3', '5', '6', '7', '8'],
        '[70-80)': ['1', '2', '3', '5', '6', '7', '8'],
        '[80-90)': ['1', '2', '3', '5', '6', '7', '8'],
        '[90-100)': ['1', '2', '3', '5', '6', '7', '8']
    };
    
    // Discharge disposition options based on age and admission type
    const dischargeDispositionOptions = {
        '[0-10)': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'],
        '[10-20)': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'],
        '[20-30)': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'],
        '[30-40)': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'],
        '[40-50)': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'],
        '[50-60)': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'],
        '[60-70)': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'],
        '[70-80)': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'],
        '[80-90)': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'],
        '[90-100)': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30']
    };
    
    // Admission source options based on age
    const admissionSourceOptions = {
        '[0-10)': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '17', '18', '19', '20', '21', '22', '23', '24', '25'],
        '[10-20)': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '15', '17', '18', '19', '20', '21', '22', '23', '24', '25'],
        '[20-30)': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '15', '17', '18', '19', '20', '21', '22', '23', '24', '25'],
        '[30-40)': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '15', '17', '18', '19', '20', '21', '22', '23', '24', '25'],
        '[40-50)': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '15', '17', '18', '19', '20', '21', '22', '23', '24', '25'],
        '[50-60)': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '15', '17', '18', '19', '20', '21', '22', '23', '24', '25'],
        '[60-70)': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '15', '17', '18', '19', '20', '21', '22', '23', '24', '25'],
        '[70-80)': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '15', '17', '18', '19', '20', '21', '22', '23', '24', '25'],
        '[80-90)': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '15', '17', '18', '19', '20', '21', '22', '23', '24', '25'],
        '[90-100)': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '15', '17', '18', '19', '20', '21', '22', '23', '24', '25']
    };
    
    // Function to filter dropdown options
    function filterDropdown(selectElement, allowedValues) {
        const currentValue = selectElement.value;
        const options = selectElement.querySelectorAll('option');
        const label = selectElement.previousElementSibling;
        
        // Count total options (excluding placeholder)
        const totalOptions = options.length - 1;
        const allowedCount = allowedValues.length;
        
        options.forEach(option => {
            if (option.value === '') {
                option.style.display = 'block'; // Keep placeholder
            } else if (allowedValues.includes(option.value)) {
                option.style.display = 'block';
            } else {
                option.style.display = 'none';
            }
        });
        
        // Reset to placeholder if current value is not allowed
        if (currentValue && !allowedValues.includes(currentValue)) {
            selectElement.value = '';
        }
        
        // Add visual feedback for filtered fields
        if (allowedCount < totalOptions) {
            selectElement.classList.add('filtered');
            if (label) label.classList.add('filtered');
        } else {
            selectElement.classList.remove('filtered');
            if (label) label.classList.remove('filtered');
        }
    }
    
    // Age change handler
    ageSelect.addEventListener('change', function() {
        const selectedAge = this.value;
        if (selectedAge) {
            // Filter admission type based on age
            const allowedAdmissionTypes = admissionTypeOptions[selectedAge] || [];
            filterDropdown(admissionTypeSelect, allowedAdmissionTypes);
            
            // Filter discharge disposition based on age
            const allowedDischargeDispositions = dischargeDispositionOptions[selectedAge] || [];
            filterDropdown(dischargeDispositionSelect, allowedDischargeDispositions);
            
            // Filter admission source based on age
            const allowedAdmissionSources = admissionSourceOptions[selectedAge] || [];
            filterDropdown(admissionSourceSelect, allowedAdmissionSources);
        } else {
            // Reset all dependent fields
            resetDependentFields();
        }
    });
    
    // Function to reset dependent fields
    function resetDependentFields() {
        const dependentFields = [admissionTypeSelect, dischargeDispositionSelect, admissionSourceSelect];
        dependentFields.forEach(field => {
            field.value = '';
            const options = field.querySelectorAll('option');
            options.forEach(option => {
                option.style.display = 'block';
            });
        });
    }
    
    // Length of stay filtering based on admission type
    const timeInHospitalSelect = document.getElementById('time_in_hospital');
    
    admissionTypeSelect.addEventListener('change', function() {
        const admissionType = this.value;
        const age = ageSelect.value;
        
        if (admissionType === '4' && age === '[0-10)') {
            // Newborn admissions typically have shorter stays
            const shortStayOptions = ['1', '2', '3', '4', '5', '6', '7'];
            filterDropdown(timeInHospitalSelect, shortStayOptions);
        } else if (admissionType === '1' || admissionType === '2') {
            // Emergency/Urgent admissions might have longer stays
            const allStayOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'];
            filterDropdown(timeInHospitalSelect, allStayOptions);
        } else {
            // Elective and other admissions
            const electiveStayOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'];
            filterDropdown(timeInHospitalSelect, electiveStayOptions);
        }
    });
    
    // Medication filtering based on age and diagnoses
    const numMedicationsSelect = document.getElementById('num_medications');
    const numberDiagnosesSelect = document.getElementById('number_diagnoses');
    
    function updateMedicationOptions() {
        const age = ageSelect.value;
        const diagnoses = parseInt(numberDiagnosesSelect.value) || 0;
        
        if (age === '[0-10)' || age === '[10-20)') {
            // Younger patients typically have fewer medications
            const youngPatientMeds = Array.from({length: 21}, (_, i) => i.toString()); // 0-20
            filterDropdown(numMedicationsSelect, youngPatientMeds);
        } else if (age === '[80-90)' || age === '[90-100)') {
            // Older patients might have more medications
            const allMedOptions = Array.from({length: 51}, (_, i) => i.toString()); // 0-50
            filterDropdown(numMedicationsSelect, allMedOptions);
        } else {
            // Middle-aged patients
            const middleAgeMeds = Array.from({length: 41}, (_, i) => i.toString()); // 0-40
            filterDropdown(numMedicationsSelect, middleAgeMeds);
        }
    }
    
    numberDiagnosesSelect.addEventListener('change', updateMedicationOptions);
    ageSelect.addEventListener('change', updateMedicationOptions);
    
    // Lab procedures filtering based on diagnoses and age
    const numLabProceduresSelect = document.getElementById('num_lab_procedures');
    
    function updateLabProcedureOptions() {
        const diagnoses = parseInt(numberDiagnosesSelect.value) || 0;
        const age = ageSelect.value;
        
        if (diagnoses <= 2) {
            // Fewer diagnoses = fewer lab procedures
            const lowLabOptions = Array.from({length: 21}, (_, i) => i.toString()); // 0-20
            filterDropdown(numLabProceduresSelect, lowLabOptions);
        } else if (diagnoses >= 10) {
            // More diagnoses = more lab procedures
            const allLabOptions = Array.from({length: 101}, (_, i) => i.toString()); // 0-100
            filterDropdown(numLabProceduresSelect, allLabOptions);
        } else {
            // Moderate diagnoses
            const moderateLabOptions = Array.from({length: 51}, (_, i) => i.toString()); // 0-50
            filterDropdown(numLabProceduresSelect, moderateLabOptions);
        }
    }
    
    numberDiagnosesSelect.addEventListener('change', updateLabProcedureOptions);
    
    // Glucose and A1C filtering based on diabetes medication
    const maxGluSerumSelect = document.getElementById('max_glu_serum');
    const a1cResultSelect = document.getElementById('A1Cresult');
    const diabetesMedSelect = document.getElementById('diabetesMed');
    
    function updateGlucoseOptions() {
        const diabetesMed = diabetesMedSelect.value;
        
        if (diabetesMed === 'Yes') {
            // Diabetic patients are more likely to have glucose tests
            const diabeticGlucoseOptions = ['Norm', '>200', '>300'];
            filterDropdown(maxGluSerumSelect, diabeticGlucoseOptions);
            
            const diabeticA1cOptions = ['Norm', '>7', '>8'];
            filterDropdown(a1cResultSelect, diabeticA1cOptions);
        } else if (diabetesMed === 'No') {
            // Non-diabetic patients might not have glucose tests
            const nonDiabeticGlucoseOptions = ['None', 'Norm'];
            filterDropdown(maxGluSerumSelect, nonDiabeticGlucoseOptions);
            
            const nonDiabeticA1cOptions = ['None', 'Norm'];
            filterDropdown(a1cResultSelect, nonDiabeticA1cOptions);
        } else {
            // Reset to all options
            const allGlucoseOptions = ['None', 'Norm', '>200', '>300'];
            filterDropdown(maxGluSerumSelect, allGlucoseOptions);
            
            const allA1cOptions = ['None', 'Norm', '>7', '>8'];
            filterDropdown(a1cResultSelect, allA1cOptions);
        }
    }
    
    diabetesMedSelect.addEventListener('change', updateGlucoseOptions);
    
    // Procedure filtering based on admission type and age
    const numProceduresSelect = document.getElementById('num_procedures');
    
    function updateProcedureOptions() {
        const admissionType = admissionTypeSelect.value;
        const age = ageSelect.value;
        
        if (admissionType === '4' && age === '[0-10)') {
            // Newborn procedures are typically minimal
            const newbornProcedures = ['0', '1', '2', '3', '4', '5'];
            filterDropdown(numProceduresSelect, newbornProcedures);
        } else if (admissionType === '1' || admissionType === '2') {
            // Emergency/Urgent admissions might have more procedures
            const emergencyProcedures = Array.from({length: 51}, (_, i) => i.toString()); // 0-50
            filterDropdown(numProceduresSelect, emergencyProcedures);
        } else if (admissionType === '3') {
            // Elective procedures are planned, might have more
            const electiveProcedures = Array.from({length: 41}, (_, i) => i.toString()); // 0-40
            filterDropdown(numProceduresSelect, electiveProcedures);
        } else {
            // Default range
            const defaultProcedures = Array.from({length: 31}, (_, i) => i.toString()); // 0-30
            filterDropdown(numProceduresSelect, defaultProcedures);
        }
    }
    
    admissionTypeSelect.addEventListener('change', updateProcedureOptions);
    ageSelect.addEventListener('change', updateProcedureOptions);
    
    // Visit history filtering based on age
    const numberOutpatientSelect = document.getElementById('number_outpatient');
    const numberEmergencySelect = document.getElementById('number_emergency');
    const numberInpatientSelect = document.getElementById('number_inpatient');
    
    function updateVisitHistoryOptions() {
        const age = ageSelect.value;
        
        if (age === '[0-10)') {
            // Young children have different visit patterns
            const youngOutpatient = Array.from({length: 11}, (_, i) => i.toString()); // 0-10
            const youngEmergency = Array.from({length: 6}, (_, i) => i.toString()); // 0-5
            const youngInpatient = Array.from({length: 6}, (_, i) => i.toString()); // 0-5
            
            filterDropdown(numberOutpatientSelect, youngOutpatient);
            filterDropdown(numberEmergencySelect, youngEmergency);
            filterDropdown(numberInpatientSelect, youngInpatient);
        } else if (age === '[80-90)' || age === '[90-100)') {
            // Elderly patients might have more visits
            const elderlyOutpatient = Array.from({length: 43}, (_, i) => i.toString()); // 0-42
            const elderlyEmergency = Array.from({length: 21}, (_, i) => i.toString()); // 0-20
            const elderlyInpatient = Array.from({length: 21}, (_, i) => i.toString()); // 0-20
            
            filterDropdown(numberOutpatientSelect, elderlyOutpatient);
            filterDropdown(numberEmergencySelect, elderlyEmergency);
            filterDropdown(numberInpatientSelect, elderlyInpatient);
        } else {
            // Middle-aged patients
            const middleOutpatient = Array.from({length: 31}, (_, i) => i.toString()); // 0-30
            const middleEmergency = Array.from({length: 11}, (_, i) => i.toString()); // 0-10
            const middleInpatient = Array.from({length: 11}, (_, i) => i.toString()); // 0-10
            
            filterDropdown(numberOutpatientSelect, middleOutpatient);
            filterDropdown(numberEmergencySelect, middleEmergency);
            filterDropdown(numberInpatientSelect, middleInpatient);
        }
    }
    
    ageSelect.addEventListener('change', updateVisitHistoryOptions);
    
    // Medication change filtering based on diabetes medication
    const changeSelect = document.getElementById('change');
    
    function updateMedicationChangeOptions() {
        const diabetesMed = diabetesMedSelect.value;
        
        if (diabetesMed === 'Yes') {
            // Diabetic patients are more likely to have medication changes
            const diabeticChangeOptions = ['No', 'Ch'];
            filterDropdown(changeSelect, diabeticChangeOptions);
        } else {
            // Non-diabetic patients less likely to have medication changes
            const nonDiabeticChangeOptions = ['No'];
            filterDropdown(changeSelect, nonDiabeticChangeOptions);
        }
    }
    
    diabetesMedSelect.addEventListener('change', updateMedicationChangeOptions);
    
    // Reset form functionality
    const resetButton = document.getElementById('reset-form');
    const predictionForm = document.getElementById('prediction-form');
    
    resetButton.addEventListener('click', function() {
        // Reset all form fields
        predictionForm.reset();
        
        // Reset all visual filters
        const allSelects = predictionForm.querySelectorAll('select');
        allSelects.forEach(select => {
            select.classList.remove('filtered');
            const label = select.previousElementSibling;
            if (label) label.classList.remove('filtered');
            
            // Show all options
            const options = select.querySelectorAll('option');
            options.forEach(option => {
                option.style.display = 'block';
            });
        });
        
        // Hide prediction result
        const resultDiv = document.getElementById('prediction-result');
        if (resultDiv) {
            resultDiv.style.display = 'none';
        }
        
        console.log('Form reset - all filters cleared');
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Diabetes Readmission Portfolio...');
    
    // Load all data sections
    loadOverview();
    loadVisualizations();
    loadModelPerformance();
    
    // Setup dynamic form filtering
    setupDynamicFiltering();
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Add some sample data for demonstration if API is not available
function loadSampleData() {
    console.log('Loading sample data for demonstration...');
    
    // Sample overview data
    const sampleOverview = {
        total_patients: 101766,
        total_encounters: 101766,
        readmission_rate: 0.1116,
        readmission_breakdown: {
            'NO': 54864,
            '>30': 35545,
            '<30': 11357
        }
    };
    
    // Sample model performance
    const sampleModelPerformance = {
        logistic_regression: {
            roc_auc: 0.6622,
            pr_auc: 0.1993
        },
        xgboost: {
            roc_auc: 0.6702,
            pr_auc: 0.2101
        }
    };
    
    console.log('Sample data loaded:', { sampleOverview, sampleModelPerformance });
}

// Call sample data function
loadSampleData();
