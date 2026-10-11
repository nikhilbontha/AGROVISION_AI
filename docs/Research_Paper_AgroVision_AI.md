# AI-Based Crop Disease Detection and Yield Prediction System

**Bontha Nikhil**  
*Department of Artificial Intelligence and Machine Learning*  
*School of Engineering, Anurag University, Hyderabad, India*  
nikhilbontha00@gmail.com  

**Gundamoni Ganga**  
*Department of Artificial Intelligence and Machine Learning*  
*School of Engineering, Anurag University, Hyderabad, India*  
Goundamoniganga@gmail.com  

**Rishi Ankathi**  
*Department of Artificial Intelligence and Machine Learning*  
*School of Engineering, Anurag University, Hyderabad, India*  
ankathirishi@gmail.com  

**Dr. Padmini Chattu** *(Project Guide)*  
*Department of Artificial Intelligence and Machine Learning*  
*School of Engineering, Anurag University, Hyderabad, India*  
padmini.ai@anurag.edu.in  

---

### Abstract
Agriculture is the foundation of economic stability and food security in India, yet crop productivity is frequently compromised by infectious plant diseases, unpredictable weather patterns, and market price volatility. Traditional manual inspection of plant leaves is slow, subjective, and prone to error, often leading farmers to misidentify diseases and apply improper chemical treatments. In this project, we developed **AgroVision AI**, an end-to-end intelligent agricultural decision-support platform that integrates computer vision for crop disease diagnosis with machine learning for crop yield prediction and financial forecasting. For disease detection, we utilized transfer learning with an EfficientNetB0 Convolutional Neural Network (CNN) trained on plant leaf images, combined with OpenCV-based HSV color masking and contour detection to visually highlight infected lesion areas and quantify disease severity. For yield prediction, a Random Forest Regressor was built using agronomic parameters including temperature, humidity, rainfall, soil type, and an engineered Temperature-Humidity Index (THI), linked with live weather data from Open-Meteo and market prices from Agmarknet. During real-time field testing, we encountered a critical practical challenge: when uploading raw leaf photos under natural field lighting without specifying the crop type, the auto-detection classifier occasionally misidentified crop species, notably mistaking a wheat leaf image for another foliage crop. Because passing an incorrect crop image into a disease classifier yields misleading diagnoses, our testing demonstrated that correct crop species identification prior to disease classification is mandatory. To resolve this, we implemented a multi-stage resolution pipeline incorporating user crop selection locking, filename cues, multi-spectral HSV feature checks, and neural probability aggregation. This paper details our system design, mathematical formulation, software architecture, experimental results, field testing observations, limitations, and future enhancements.

**Index Terms**—Crop Disease Detection, Transfer Learning, EfficientNetB0, Random Forest Regressor, Computer Vision, OpenCV Lesion Masking, Crop Identification, Yield Prediction, FastAPI, Agriculture Tech.

---

### I. INTRODUCTION

Agriculture plays a central role in feeding growing global populations and sustaining rural livelihoods, particularly in developing economies such as India. However, farmers continually face multi-faceted challenges, ranging from foliar plant diseases caused by fungal, bacterial, and viral pathogens to changing micro-climates and volatile crop market rates. According to agricultural surveys, annual crop yield losses due to pests and diseases range between 20% and 40% globally. Early detection and localized advisory are therefore essential to prevent devastating crop failures and maintain farm profitability.

Historically, disease identification relied heavily on visual examination by experienced farmers or agricultural extension officers. In practice, this manual approach presents severe operational bottlenecks. Many plant pathogens produce overlapping visual symptoms—such as leaf chlorosis (yellowing), necrotic spots, and rust pustules—making accurate visual diagnosis difficult for non-experts. Furthermore, agricultural officers cannot physically visit every farm in a timely manner. Delayed diagnoses often force farmers to apply broad-spectrum chemical pesticides reactively, which increases production costs and harms local ecosystems.

Recent advances in artificial intelligence, specifically deep learning and computer vision, offer a promising alternative for automated, non-invasive plant health diagnostics. Convolutional Neural Networks (CNNs) have shown impressive performance in classifying spatial patterns, textures, and color variations in digital images. Concurrently, machine learning regression models can synthesize environmental data—such as ambient temperature, relative humidity, seasonal rainfall, and soil parameters—to estimate crop harvest yields before harvest season.

In our B.Tech major project, we designed and implemented **AgroVision AI**, a full-stack agricultural assistant that combines deep learning visual diagnostics with regression-based yield modeling and real-time API integrations. The system allows farmers to upload leaf photographs through a modern web interface, receive instant disease diagnoses with severity ratings, view highlighted infected leaf areas, and calculate expected crop harvest tonnage and net profit based on live market prices.

Throughout the development and testing process, we paid close attention to real-world deployment realities rather than relying solely on clean laboratory benchmark datasets. In particular, our live field testing highlighted the fundamental importance of accurate crop species identification as a prerequisite for disease analysis. This paper provides a complete account of our system architecture, algorithms, field test findings, technical limitations, and future directions.

---

### II. PROBLEM STATEMENT

Small-scale and mid-scale farmers face three distinct but interconnected operational problems:

1. **Inaccurate and Delayed Disease Identification:** Foliar diseases spread rapidly across field plots. When farmers misinterpret early symptoms (e.g., confusing bacterial spot with early blight), they buy incorrect chemical treatments. This wastes financial resources and allows the infection to spread unchecked.
2. **Uncertainty in Yield Estimation and Market Planning:** Estimating expected crop yield before harvest is vital for planning storage, logistics, and sales. Manual estimation based on intuition is unreliable because yield depends non-linearly on weather fluctuations, soil types, and land area.
3. **Lack of Integrated Technical Tools:** Existing tools are fragmented; a farmer must use separate applications for weather forecasts, market rates, and disease guides. There is a lack of unified platforms that combine visual image analysis, environmental data, and localized financial calculations into a single workflow.

Furthermore, an unaddressed issue in automated disease classification systems is **crop species ambiguity**. Deep learning models trained on specific leaf datasets (such as PlantVillage) often assume that the input image belongs to a supported crop. If a user uploads a wheat leaf image, but the system auto-detects it as a tomato leaf, the neural network evaluates the wheat image against tomato disease features. This produces invalid diagnostic reports and erodes user trust. Therefore, establishing reliable crop identification prior to disease diagnostics is a critical problem that must be addressed.

---

### III. OBJECTIVES

The primary objectives of our project are as follows:

* **Develop an Image-Based Disease Diagnostic Engine:** To implement a deep learning pipeline using transfer learning (EfficientNetB0) capable of categorizing plant leaf images into healthy and diseased classes across multiple crop species.
* **Integrate OpenCV Visual Lesion Highlighting:** To extract visual disease features using HSV color masking and contour analysis, drawing bounding boxes around necrotic spots and quantifying lesion density to provide a physical severity score.
* **Build a Machine Learning Crop Yield Prediction Model:** To design and train a Random Forest Regressor using environmental variables (temperature, humidity, rainfall, soil pH, land area) and an engineered Temperature-Humidity Index (THI) to predict harvest tonnage.
* **Incorporate Real-Time Weather and Market APIs:** To integrate external live services (Open-Meteo for district weather and Agmarknet for APMC market rates) to enable dynamic financial calculations (cost, revenue, net profit, and loss risk).
* **Address Crop Misclassification in Real-World Testing:** To analyze auto-detection failures during live field testing—specifically addressing cases where wheat leaf images were misidentified—and implement a robust, multi-layer crop resolution mechanism.
* **Deploy a Farmer-Friendly Web Platform:** To construct a responsive web interface using React.js and FastAPI with multi-language support (English and Telugu) to ensure usability for regional agricultural communities.

---

### IV. RELATED WORK

Automated agricultural diagnostics using machine learning and computer vision has been an active area of research over the past decade. Early approaches relied on handcrafted visual features such as Color Co-occurrence Matrices (CCM), Scale-Invariant Feature Transform (SIFT), and Histogram of Oriented Gradients (HOG), combined with classical classifiers like Support Vector Machines (SVM) or Random Forests. While these methods worked reasonably well under controlled laboratory lighting, they struggled to generalize across complex field environments with varying shadows, leaf overlaps, and background soil textures.

With the advent of deep learning, Convolutional Neural Networks became the preferred standard for image classification. Mohanty et al. evaluated AlexNet and GoogLeNet architectures on the PlantVillage dataset containing 54,305 images across 14 crop species and 26 diseases, achieving classification accuracies exceeding 99% on controlled test sets. However, the authors noted a significant performance drop when testing the models on unconstrained field photographs, highlighting the gap between laboratory datasets and real-world agricultural conditions.

Subsequent studies focused on transfer learning using modern convolutional architectures such as MobileNetV2, ResNet-50, and EfficientNet. EfficientNet, introduced by Tan and Le, uses a compound scaling method that uniformly scales network depth, width, and resolution. This makes it particularly suitable for deployment on resource-constrained web servers because it achieves high accuracy with fewer parameters compared to older networks.

In the area of crop yield forecasting, researchers have investigated both regression trees and remote-sensing satellite models. Scikit-learn implementations of Random Forest Regressors have been widely adopted for local yield modeling due to their ability to capture non-linear relationships between weather variables, soil characteristics, and crop output without making strong parametric assumptions.

Despite these advancements, most existing literature treats crop disease classification and yield prediction as isolated tasks. Furthermore, very few studies explicitly address the operational failure mode where an auto-detection system misidentifies the underlying crop species prior to disease scoring. In our work, we bridge these gaps by combining disease diagnostics, OpenCV lesion analysis, yield regression, real-time weather/market APIs, and a explicit multi-layered crop species verification step into a unified full-stack system.

---

### V. PROPOSED SYSTEM

The proposed **AgroVision AI** system is designed as a decoupled, multi-tier web application architecture consisting of a React.js client interface, a FastAPI asynchronous backend server, MongoDB Atlas cloud storage, and machine learning inference components.

```
+-------------------------------------------------------------------+
|                        FARMER / USER INTERFACE                     |
|                   (React.js + Tailwind CSS + Vite)                |
+---------------------------------+---------------------------------+
                                  |
                                  | HTTP / REST API Requests
                                  v
+-------------------------------------------------------------------+
|                         FASTAPI BACKEND SERVICE                   |
|  +-------------------------------------------------------------+  |
|  | Authentication & Security (JWT + Passlib Bcrypt)            |  |
|  +------------------------------+------------------------------+  |
|                                 |                                 |
|         +-----------------------+-----------------------+         |
|         |                                               |         |
|         v                                               v         |
|  +----------------------------+   +----------------------------+  |
|  | Disease Diagnostics Route  |   | Yield Prediction Route     |  |
|  | (/api/predict-disease)     |   | (/api/predict-yield)       |  |
|  +--------------+-------------+   +--------------+-------------+  |
|                 |                                |                |
+-----------------|--------------------------------|----------------+
                  |                                |
                  v                                v
+----------------------------------+ +------------------------------+
| MACHINE LEARNING & CV PIPELINE   | | EXTERNAL SERVICES & DATA     |
| 1. Crop Species Resolution       | | 1. Open-Meteo Weather API    |
| 2. EfficientNetB0 CNN Model      | | 2. Agmarknet APMC Market API|
| 3. OpenCV HSV Lesion Detection   | | 3. MongoDB Atlas Database  |
+----------------------------------+ +------------------------------+
```
*Fig. 1. High-level system architecture of AgroVision AI showing client-server interaction, ML engines, and external API integrations.*

The system workflow operates through two main functional pipelines:

1. **Disease Diagnostic Pipeline:** The user selects the crop species (or chooses auto-detection) and uploads a leaf photograph. The backend resolves the target crop family, feeds the image into the EfficientNetB0 CNN model for disease identification, passes the image to an OpenCV image-processing function to mask necrotic/chlorotic spots, counts infected areas, calculates severity, and returns diagnostic recommendations.
2. **Yield & Financial Prediction Pipeline:** The user submits district location, crop type, soil type, and land area (in acres). The backend queries Open-Meteo for live weather data (temperature, humidity), computes the Temperature-Humidity Index (THI), passes the features to the trained Random Forest Regressor, fetches live market prices per quintal from Agmarknet, and calculates total harvest tonnage, estimated cost, gross revenue, net profit, and tailored farming suggestions.

---

### VI. SYSTEM ARCHITECTURE

The software stack was built using modular, production-ready technologies to ensure maintainability and low latency:

#### A. Frontend Technology Stack
* **Framework:** React.js (v18) built with Vite for fast client-side rendering and fast build pipelines.
* **Styling & Animation:** Vanilla CSS design system extended with Tailwind CSS utility classes and Framer Motion for interactive page transitions and UI components.
* **Data Visualization:** Recharts library for rendering historical yield trends, confidence scores, and financial breakdowns.
* **State & Localization:** React Context API (`AdminContext` and `LanguageContext`) to manage user session states and enable live translation between English and Telugu.

#### B. Backend Technology Stack
* **Framework:** FastAPI (Python 3.10+), selected for its native asynchronous request handling (`async/await`), high throughput, and automatic OpenAPI swagger documentation.
* **Database Driver:** Motor (async MongoDB driver) connecting to MongoDB Atlas for storing user profiles, disease diagnostic logs, and yield calculation records.
* **Security:** JSON Web Tokens (JWT) for stateless user authentication and Passlib with Bcrypt for password hashing.

#### C. Machine Learning Engine Stack
* **Deep Learning Framework:** TensorFlow 2.x / Keras for model architecture definition, transfer learning, and model serialization (`.h5` files).
* **Computer Vision Library:** OpenCV (`cv2`) and NumPy for pixel-level array manipulation, HSV color space conversion, threshold masking, and contour detection.
* **Classical Machine Learning:** Scikit-learn (`sklearn`) for Random Forest regression modeling, feature scaling (`StandardScaler`), imputation (`SimpleImputer`), and categorical encoding (`OneHotEncoder`).

---

### VII. METHODOLOGY

The technical methodology is divided into three core functional modules: Crop Species Identification, Disease Diagnostics, and Yield & Financial Prediction.

```
                      [ User Uploads Leaf Image ]
                                   |
                                   v
                  +--------------------------------+
                  |  Step 1: Crop Species Check    |
                  |  - User Dropdown Selection?    |
                  |  - Filename Keyword Match?     |
                  |  - Multi-spectral HSV Analysis?|
                  |  - Neural Probability Sum?     |
                  +----------------+---------------+
                                   |
                                   v
                     [ Target Crop Resolved ]
                                   |
                                   v
                  +--------------------------------+
                  |  Step 2: Deep Learning CNN     |
                  |  (EfficientNetB0 Model)        |
                  |  - Resized 224x224 RGB Image   |
                  |  - Categorical Probability     |
                  |  - Disease Class Mapping       |
                  +----------------+---------------+
                                   |
                                   v
                  +--------------------------------+
                  |  Step 3: OpenCV Lesion Masking |
                  |  - HSV Color Space Conversion  |
                  |  - Necrotic Brown Masking      |
                  |  - Chlorotic Yellow Masking    |
                  |  - Contour Bounding Boxes      |
                  |  - Lesion Count & Severity     |
                  +----------------+---------------+
                                   |
                                   v
                     [ Complete Diagnostic Output ]
```
*Fig. 2. Operational workflow of the Crop Identification and Disease Diagnostics Engine.*

#### A. Crop Identification & Resolution Pipeline
To prevent crop misclassification errors, we built a 4-tier decision function `resolve_target_crop()` in `backend/app/routes/predict.py`. The strategy applies rules in order of strict priority:

1. **User Selection Lock (Highest Priority):** If the user explicitly selects a crop from the UI dropdown menu (e.g., "Wheat", "Rice", "Tomato"), the system locks this selection (100% priority) and bypasses auto-detection guessing.
2. **Filename Keyword Cues:** If set to "Auto-Detect", the system inspects the image filename string for definitive crop identifiers (e.g., `wheat`, `stripe_rust`, `triticum`, `rice`, `paddy`, `solanum`).
3. **Multi-Spectral HSV Feature Extraction:** The image is converted to HSV color space to evaluate macro visual features:
   * *Paddy Rice Mask:* Evaluates yellowish-green slender grain/foliage ratios:
     $$\text{Mask}_{\text{rice}} = \text{HSV} \in ([25, 40, 50], [55, 255, 255])$$
   * *Corn/Gold Mask:* Evaluates golden-yellow kernel and rust hues:
     $$\text{Mask}_{\text{corn}} = \text{HSV} \in ([12, 100, 100], [28, 255, 255])$$
   * *Broad Dark Green Foliage:* Evaluates tomato, potato, and pepper leaf coverage:
     $$\text{Mask}_{\text{foliage}} = \text{HSV} \in ([36, 60, 40], [85, 255, 240])$$
4. **Neural Classifier Probability Aggregation:** If the above visual feature checks remain inconclusive, the system runs the CNN model and sums softmax prediction probabilities across crop families. The CNN result overrides visual features only if the aggregated family confidence exceeds a strict threshold of $60\%$.

#### B. Disease Detection & OpenCV Lesion Masking Engine
The disease detection engine uses **EfficientNetB0** transfer learning pretrained on ImageNet. The base network layers are frozen to preserve generalized visual feature extractors, while customized fully-connected classification head layers are appended:

$$\text{Output} = \text{Softmax}\Big(\text{Dense}_{N}\Big(\text{Dropout}_{0.5}\Big(\text{Dense}_{256}\Big(\text{GlobalAveragePooling2D}\big(f_{\text{EfficientNet}}(X)\big)\Big)\Big)\Big)\Big)$$

Where $X$ is the input image tensor of shape $(224, 224, 3)$.

To complement neural probability outputs with visual evidence, we implemented an OpenCV lesion analysis module `analyze_lesion_masking()`. This routine isolates infected leaf tissue using dual-range color thresholding:

1. **Necrotic Brown Spot Masking:**
   $$\text{Lower}_{\text{brown}} = [5, 40, 20], \quad \text{Upper}_{\text{brown}} = [25, 255, 200]$$
2. **Chlorotic Yellow Halo Masking:**
   $$\text{Lower}_{\text{yellow}} = [16, 60, 60], \quad \text{Upper}_{\text{yellow}} = [38, 255, 255]$$

The combined binary mask is generated via bitwise OR:

$$\text{Mask}_{\text{combined}} = \text{Mask}_{\text{brown}} \lor \text{Mask}_{\text{yellow}}$$

Morphological opening and closing operations using a $5 \times 5$ elliptical kernel remove isolated pixel noise and close small gaps within lesion boundaries. Contours are extracted using `cv2.findContours()`. Bounding rectangles and center points are drawn over contours meeting area bounds ($25 < \text{Area} < 0.25 \times \text{ImageArea}$).

```
+-----------------------------------------------------------------+
|                      RAW INPUT IMAGE (RGB)                      |
+--------------------------------+--------------------------------+
                                 |
                                 v
+-----------------------------------------------------------------+
|                  HSV COLOR SPACE CONVERSION                     |
+--------------------------------+--------------------------------+
                                 |
                                 v
+--------------------------------+--------------------------------+
|  Necrotic Brown Mask (HSV)     |  Chlorotic Yellow Mask (HSV)   |
|  [5, 40, 20] to [25, 255, 200] |  [16, 60, 60] to [38, 255, 255] |
+--------------------------------+--------------------------------+
                                 |
                                 v
+-----------------------------------------------------------------+
|            BITWISE OR COMBINED MASK & MORPHOLOGY                |
|               (5x5 Elliptical Structuring Element)              |
+--------------------------------+--------------------------------+
                                 |
                                 v
+-----------------------------------------------------------------+
|                   CONTOUR DETECTION & BOUNDING                  |
|          Draw Red Rectangles & Yellow Center Centroids          |
+--------------------------------+--------------------------------+
                                 |
                                 v
+-----------------------------------------------------------------+
|           LESION COUNT & SEVERITY LEVEL DETERMINATION           |
|      Count = 0 -> Healthy | 1-5 -> Low | 6-15 -> Med | >15 -> High|
+-----------------------------------------------------------------+
```
*Fig. 3. Step-by-step OpenCV HSV computer vision masking and contour analysis pipeline.*

Disease severity is determined by the total detected lesion contour count:
* **Count = 0:** Healthy Foliage (Green confirmation overlay)
* **Count 1 to 5:** Low Severity
* **Count 6 to 15:** Medium Severity
* **Count > 15:** High Severity

#### C. Yield Prediction & Financial Calculation Model
The crop yield prediction engine uses a **Random Forest Regressor** trained on historical and agronomic parameters. 

##### 1) Feature Engineering:
In agricultural science, high ambient temperatures combined with high humidity create heat stress that suppresses plant growth. We engineered the Temperature-Humidity Index (THI) feature:

$$\text{THI} = T - \big(0.55 - 0.0055 \times H\big) \times \big(T - 14.5\big)$$

Where $T$ is temperature in °C and $H$ is relative humidity percentage.

##### 2) Machine Learning Pipeline:
The complete pipeline integrates data preprocessing and model execution via Scikit-learn `Pipeline`:
* **Numeric Features** (`Temperature`, `Humidity`, `Rainfall`, `Area`, `THI`): Imputed with median values using `SimpleImputer` and scaled using `StandardScaler`.
* **Categorical Features** (`Soil_Type`, `Crop_Type`): Imputed with most frequent values and transformed using `OneHotEncoder(handle_unknown='ignore', drop='first')`.
* **Regressor:** `RandomForestRegressor(n_estimators=100, random_state=42)`.

##### 3) Real-Time Financial Calculations:
When a prediction request is received, the backend queries the Open-Meteo API for current district weather ($T_{\text{actual}}, H_{\text{actual}}$) and the Agmarknet API for current market price per quintal ($P_{\text{quintal}}$). Financial forecasts are calculated as follows:

$$\text{Yield}_{\text{total}} = \text{Yield}_{\text{per\_acre}} \times \text{Area}_{\text{acres}}$$

$$\text{Price}_{\text{per\_ton}} = P_{\text{quintal}} \times 10$$

$$\text{Revenue}_{\text{estimated}} = \text{Yield}_{\text{total}} \times \text{Price}_{\text{per\_ton}}$$

$$\text{Cost}_{\text{estimated}} = \text{Cost}_{\text{per\_acre}} \times \text{Area}_{\text{acres}}$$

$$\text{Profit}_{\text{expected}} = \text{Revenue}_{\text{estimated}} - \text{Cost}_{\text{estimated}}$$

---

### VIII. SYSTEM IMPLEMENTATION

The implemented web application provides interactive features for farmers and administrators alike.

```
+-----------------------------------------------------------------------+
|  AGROVISION AI - SMART CROP DISEASE & YIELD PREDICTION DASHBOARD      |
+-----------------------------------------------------------------------+
| [ Home ] [ Disease Diagnostics ] [ Yield Calculator ] [ History ]      |
+-----------------------------------------------------------------------+
|                                                                       |
|  +---------------------------------+ +-----------------------------+  |
|  | CROP DISEASE DIAGNOSTIC SCANNER | | DIAGNOSTIC RESULT REPORT    |  |
|  |                                 | |                             |  |
|  | Select Crop: [ Wheat      v ]   | | Detected: Wheat Stripe Rust |  |
|  |                                 | | Confidence: 94.8%           |  |
|  | +-----------------------------+ | | Severity: High (18 Lesions)|  |
|  | |                             | | |                             |  |
|  | |   [ Upload Leaf Image ]     | | | [ Highlighted Lesion Box ]  |  |
|  | |                             | | |                             |  |
|  | +-----------------------------+ | | Organic & Chemical Advice:  |  |
|  |                                 | | - Apply Propiconazole 25% EC|  |
|  | [ RUN DIAGNOSTIC SCAN ]         | | - Maintain field drainage   |  |
|  +---------------------------------+ +-----------------------------+  |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | CROP YIELD & FINANCIAL PREDICTION CALCULATOR                    |  |
|  | District: [ Hyderabad ]  Soil: [ Loamy ]  Area: [ 5.0 Acres ]     |  |
|  | Expected Yield: 19.0 Tons  |  Est. Cost: Rs. 1,40,000           |  |
|  | Market Price: Rs. 2,250/Qtl |  Est. Revenue: Rs. 4,27,500        |  |
|  | Net Expected Profit: Rs. 2,87,500 (Trend: +4.2% Bullish)          |  |
|  +-----------------------------------------------------------------+  |
+-----------------------------------------------------------------------+
```
*Fig. 4. UI layout of the AgroVision AI web application showing disease diagnostic inputs, visual output highlighting, and yield prediction summary.*

Key implemented user interface and backend components include:

1. **Disease Diagnostic Module:**
   * Includes a crop selector dropdown (`Auto-Detect`, `Wheat`, `Rice`, `Corn`, `Tomato`, `Potato`, `Apple`, `Grape`, `Cotton`, etc.).
   * Displays dual side-by-side image views: raw uploaded photo vs. processed OpenCV output with red bounding boxes and yellow centroids over infected spots.
   * Displays disease confidence percentage, severity level, scientific pathogen name, visible symptoms, organic treatments, chemical sprays, and emergency action timelines.
2. **Yield & Financial Calculator Module:**
   * Accepts user inputs for district, soil type, crop type, and farm acreage.
   * Auto-fetches live weather data (temperature, humidity, wind speed) and displays a weather impact assessment.
   * Displays financial metrics including estimated yield per acre, total harvest, cost of cultivation, market revenue, expected net profit, and market price trend indicators (Bullish/Bearish).
3. **Multi-Language Support (English & Telugu):**
   * Integrated translation maps for crop names, disease titles, and smart agricultural suggestions (e.g., translating "Stripe Rust" into *"పసుపు కుంకుమ తెగులు"*).
4. **Historical Log & Admin Analytics Dashboard:**
   * All diagnostic scans and yield predictions are saved asynchronously to MongoDBAtlas collections (`disease_collection` and `yield_collection`).
   * An administrative dashboard (`/admin`) allows viewing total system user counts, diagnostic scan distribution by crop type, and average predicted profit margins.

---

### IX. EXPERIMENTAL SETUP

#### A. Hardware and Software Environment
All training, development, and testing procedures were executed under the environment specifications detailed in Table I.

##### TABLE I. HARDWARE AND SOFTWARE ENVIRONMENT SPECIFICATIONS
| Parameter / Component | Description / Specification |
| :--- | :--- |
| **Operating System** | Microsoft Windows 11 (64-bit) |
| **CPU Architecture** | Intel Core i7 / AMD Ryzen 7 Processor |
| **System Memory (RAM)** | 16 GB DDR4 |
| **Development IDE** | VS Code (Visual Studio Code) |
| **Programming Language** | Python 3.10.11, JavaScript (ES6+) |
| **Deep Learning Framework**| TensorFlow 2.13.0 / Keras |
| **Computer Vision** | OpenCV (`opencv-python` v4.8.0) |
| **Machine Learning** | Scikit-Learn v1.3.0, Pandas v2.0.3, NumPy v1.24.3 |
| **Backend Web Server** | FastAPI v0.100.0, Uvicorn v0.22.0 |
| **Frontend Web Stack** | React.js v18.2.0, Vite v4.4.0, Tailwind CSS v3.3.0 |
| **Database System** | MongoDB Atlas Cloud (Motor Async Driver v3.2.0) |

#### B. Dataset Details and Preprocessing

##### 1) Plant Disease Image Dataset:
The primary image classification model was trained using the benchmark **PlantVillage dataset** supplemented with additional field-collected samples. The dataset contains image classes across various crop species and health states:

* **Total Images:** ~54,305 images across 38 distinct categorical classes.
* **Image Dimensions:** Standardized to $224 \times 224 \times 3$ RGB pixels.
* **Data Split:** 80% for Training (43,444 images), 10% for Validation (5,430 images), and 10% for Testing (5,431 images).
* **Augmentation Techniques:** Applied during training to improve real-world robustness:
  * Random Rotation (up to $\pm 25^{\circ}$)
  * Width and Height Shift (ratio 0.2)
  * Shear Transformation (0.15)
  * Zoom Range (0.2)
  * Horizontal Flipping
  * Brightness Adjustment ($0.8 - 1.2$)

##### 2) Crop Yield Agronomic Dataset:
The yield regression model was trained using a dataset of 1,500 agronomic records (`crop_yield.csv`) containing:
* **Numerical Features:** Temperature (°C), Humidity (%), Rainfall (mm), Land Area (Hectares), Soil pH.
* **Categorical Features:** Soil Type (`Loamy`, `Black`, `Clay`, `Red`, `Sandy`), Crop Type (`Wheat`, `Rice`, `Maize`, `Cotton`, `Sugarcane`, `Tomato`, `Potato`).
* **Target Variable:** Crop Yield (Tons per Hectare).
* **Data Split:** 80% Train Set (1,200 records), 20% Test Set (300 records).

---

### X. RESULTS AND DISCUSSION

#### A. Disease Classification Model Performance
The EfficientNetB0 transfer learning model was trained for 30 epochs using the Adam optimizer with an initial learning rate of $1 \times 10^{-4}$, categorical cross-entropy loss, early stopping (patience = 5), and learning rate reduction on plateau.

The performance metrics evaluated include Accuracy, Precision, Recall, and F1-Score:

$$\text{Accuracy} = \frac{TP + TN}{TP + TN + FP + FN}$$

$$\text{Precision} = \frac{TP}{TP + FP}, \quad \text{Recall} = \frac{TP}{TP + FN}$$

$$\text{F1-Score} = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$$

##### TABLE II. DISEASE DETECTION MODEL PERFORMANCE ON VALIDATION DATASET
| Model Architecture | Training Accuracy | Validation Accuracy | Validation Loss | Macro Precision | Macro Recall | Macro F1-Score |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Custom CNN (3 Conv Layers)| 86.4% | 82.1% | 0.482 | 0.81 | 0.80 | 0.80 |
| MobileNetV2 (Transfer) | 94.8% | 92.6% | 0.215 | 0.92 | 0.91 | 0.91 |
| **EfficientNetB0 (Proposed)**| **97.2%** | **95.6%** | **0.134** | **0.95** | **0.95** | **0.95** |

As shown in Table II, **EfficientNetB0** achieved the highest validation accuracy of **95.6%** with a low validation loss of 0.134, outperforming both the basic custom CNN and MobileNetV2.

#### B. Yield Prediction Model Performance
The Random Forest Regressor was evaluated on the 20% held-out test split using Mean Squared Error (MSE), Root Mean Squared Error (RMSE), and the Coefficient of Determination ($R^2$ Score):

$$\text{MSE} = \frac{1}{N} \sum_{i=1}^{N} (y_i - \hat{y}_i)^2$$

$$R^2 = 1 - \frac{\sum_{i=1}^{N} (y_i - \hat{y}_i)^2}{\sum_{i=1}^{N} (y_i - \bar{y})^2}$$

##### TABLE III. CROP YIELD PREDICTION REGRESSION MODEL COMPARISON
| Regression Model | Mean Absolute Error (MAE) | Mean Squared Error (MSE) | Root MSE (RMSE) | $R^2$ Score |
| :--- | :---: | :---: | :---: | :---: |
| Linear Regression | 1.42 tons/ha | 3.18 | 1.78 tons/ha | 0.64 |
| Decision Tree Regressor | 0.85 tons/ha | 1.45 | 1.20 tons/ha | 0.82 |
| **Random Forest Regressor** | **0.38 tons/ha** | **0.29** | **0.54 tons/ha** | **0.94** |

As detailed in Table III, the **Random Forest Regressor** achieved an $R^2$ score of **0.94** and a low RMSE of **0.54 tons/ha**, demonstrating that the non-linear decision trees effectively captured the relationship between climate variables, soil types, THI index, and crop yields.

#### C. Real-Time Field Testing and Crop Misclassification Case Study
While the model achieved strong validation metrics on benchmark datasets, real-time testing with unconstrained photos taken under natural sunlight revealed critical operational insights.

##### 1) The Wheat Misclassification Finding:
During field testing, when testing images in "Auto-Detect" mode without manual crop selection, some crop images were misclassified. Specifically, a photo of a wheat leaf taken in a field was misidentified as a different crop species (such as Rice/Corn or Tomato/Apple).

##### 2) Root Cause Analysis:
* *Lab vs. Field Background Discrepancy:* Benchmark datasets like PlantVillage primarily consist of leaves imaged against uniform, neutral laboratory backdrops. In contrast, field photos contain variable background textures (e.g., soil, shadows, weeds, and varying light angles).
* *Lack of Fine-Grained Cereal Leaf Features in General CNNs:* Cereal crops like wheat and rice share similar slender, linear leaf morphology. Without explicit crop-type constraints, CNN feature maps tend to activate on secondary background features or broad leaf patterns, leading to misclassification across crop families.

##### TABLE IV. AUTO-DETECT CROP IDENTIFICATION TESTING RESULTS ON REAL FIELD PHOTOS
| Test Crop Photo Category | Number of Samples Tested | Correctly Identified (Auto-Detect) | Misidentified Crop Species | Primary Cause of Misclassification |
| :--- | :---: | :---: | :---: | :--- |
| **Tomato Leaves** | 20 | 18 (90.0%) | Potato (2) | Similar Solanaceae leaf shape & spot patterns |
| **Potato Leaves** | 15 | 13 (86.7%) | Tomato (2) | Similar dark green foliage texture |
| **Apple Leaves** | 15 | 14 (93.3%) | Peach (1) | Similar tree foliage background |
| **Wheat Leaf (Field Test)**| 15 | 8 (53.3%) | **Rice (4), Corn (3)** | **Slender leaf overlap & natural soil background** |
| **Rice / Paddy Grains** | 15 | 11 (73.3%) | Wheat (4) | Yellowish-green grain/leaf visual ambiguity |

##### 3) Importance of Crop Species Identification Prior to Disease Diagnostics:
This field-testing issue highlighted a vital principle: **correct crop identification is mandatory before attempting disease diagnosis**. If the system misidentifies a wheat leaf as a tomato leaf, the CNN evaluates the image against tomato disease classes, predicting diseases like *Tomato Early Blight* or *Tomato Target Spot*. Because wheat is susceptible to entirely different pathogens (e.g., *Wheat Stripe Rust*, *Puccinia striiformis*), evaluating a wheat leaf with a tomato model produces invalid diagnostic output.

##### 4) Effectiveness of the Implemented Multi-Stage Resolution Strategy:
To address this issue, we enforced the multi-stage resolution strategy described in Section VII-A. When the user manually selects "Wheat" from the dropdown menu, the system locks the target crop family to Wheat, guaranteeing that disease evaluation is restricted strictly to wheat-relevant pathogens (*Wheat Stripe Rust*, *Leaf Rust*, *Powdery Mildew*, or *Healthy Wheat*). This hybrid approach resolved the misclassification problem during live field usage.

---

### XI. LIMITATIONS

While AgroVision AI successfully integrates visual disease diagnostics and yield prediction, we acknowledge several practical limitations based on our project implementation:

1. **Dependency on User Input for Ambiguous Field Images:** When operating strictly in auto-detect mode on low-resolution or blurry field photos, the CNN model can still misidentify crop species. The user must manually select the correct crop from the dropdown menu to guarantee accurate disease targeting.
2. **Dataset Domain Bias:** The disease detection model was trained primarily on the PlantVillage dataset. Because these images were captured in controlled environments, the model's confidence scores are lower on field images with heavy shadows, rain drops, or direct glare.
3. **Absence of Soil Sensor Hardware Integration:** The yield prediction module relies on user-reported soil types and district-level weather APIs rather than real-time Internet of Things (IoT) soil sensors (such as NPK or moisture probes).
4. **Scope of Supported Crop Diseases:** Although the system supports 17 crop species, fine-grained deep learning disease models are currently active for major crops (Tomato, Potato, Apple, Corn, Grape, Wheat, Rice, Cotton). Extended crops rely on visual spot heuristic diagnostics until full datasets are integrated.

---

### XII. FUTURE WORK

To address these limitations and expand the platform's utility, we outline the following planned future enhancements:

1. **Dedicated Two-Stage Classifier Architecture:** Train a lightweight first-stage CNN specifically dedicated to crop species identification (trained on natural field images) before routing the tensor to a second-stage disease diagnostic network.
2. **Field Image Dataset Expansion & Retraining:** Collect and annotate a localized dataset of crop leaf images captured directly under diverse field conditions across Indian agricultural zones.
3. **IoT Soil Sensor Integration:** Interface the backend with microcontroller-based IoT sensor nodes (ESP32 / Arduino) to stream live soil nitrogen, phosphorus, potassium (NPK), pH, and moisture data directly into the yield prediction model.
4. **Voice-Based Regional Interaction:** Add speech-to-text and text-to-speech capabilities in regional languages (such as Telugu and Hindi) to assist illiterate or visually impaired farmers.
5. **Mobile Application Development:** Package the frontend as a cross-platform native mobile application (React Native) with offline caching capabilities for remote farming areas with limited internet connectivity.

---

### XIII. CONCLUSION

In this project, we designed, implemented, and evaluated **AgroVision AI**, a smart crop disease detection and yield prediction platform tailored for digital agriculture. The system combines deep transfer learning (EfficientNetB0) for visual plant disease classification, OpenCV HSV color masking for lesion spot visualization and severity scoring, and a Random Forest Regressor for crop yield and profit forecasting linked with real-time weather (Open-Meteo) and APMC market (Agmarknet) APIs.

Through rigorous laboratory evaluation, our EfficientNetB0 disease model achieved a validation accuracy of **95.6%**, while the Random Forest yield model achieved an $R^2$ score of **0.94**. More importantly, real-time field testing revealed an essential practical lesson: relying solely on unconstrained CNN auto-detection can lead to crop species misclassification—such as mistaking a wheat leaf image for another crop—which compromises disease diagnosis. To overcome this challenge, we developed a multi-layered resolution engine that prioritizes explicit crop selection locking alongside filename and multi-spectral visual feature checks.

By combining visual AI diagnostics, empirical severity scoring, localized weather integration, and market financial analysis into a simple web application, AgroVision AI demonstrates how machine learning can provide accessible, actionable, and practical technical support for farmers.

---

### ACKNOWLEDGMENT

We express our sincere gratitude and deep respect to our project guide, **Dr. Padmini Chattu**, Department of Artificial Intelligence and Machine Learning, School of Engineering, Anurag University, Hyderabad, for her constant guidance, technical insight, and valuable encouragement throughout the duration of this B.Tech major project. We also thank the faculty members and laboratory staff of the Department of Artificial Intelligence and Machine Learning for providing the computational infrastructure and academic environment necessary to complete this research work.

---

### REFERENCES

[1] S. P. Mohanty, D. P. Hughes, and M. Salathé, "Using deep learning for image-based plant disease detection," *Frontiers in Plant Science*, vol. 7, p. 1419, Sep. 2016.

[2] M. Tan and Q. V. Le, "EfficientNet: Rethinking model scaling for convolutional neural networks," in *Proc. 36th Int. Conf. Mach. Learn. (ICML)*, Long Beach, CA, USA, 2019, pp. 6105–6114.

[3] A. Kamilaris and F. X. Prenafeta-Boldú, "Deep learning in agriculture: A survey," *Computers and Electronics in Agriculture*, vol. 147, pp. 70–90, Apr. 2018.

[4] J. G. A. Barbedo, "Factors affecting the use of artificial intelligence in plant disease recognition," *Biosystems Engineering*, vol. 172, pp. 84–91, Aug. 2018.

[5] G. Geetharamani and J. Pandian, "Identification of plant leaf diseases using a nine-layer deep convolutional neural network," *Computers & Electrical Engineering*, vol. 76, pp. 323–338, Jun. 2019.

[6] K. P. Ferentinos, "Deep learning models for plant disease detection and diagnosis," *Computers and Electronics in Agriculture*, vol. 145, pp. 311–318, Feb. 2018.

[7] A. Fuentes, S. Yoon, S. C. Kim, and D. S. Park, "A robust deep-learning-based detector for real-time tomato plant diseases and pests recognition," *Sensors*, vol. 17, no. 9, p. 2022, Sep. 2017.

[8] E. C. Too, L. Yujuian, S. Njuki, and L. Liu, "A comparative study of fine-tuning deep learning models for plant disease identification," *Computers and Electronics in Agriculture*, vol. 161, pp. 272–279, Jun. 2019.

[9] S. V. Militante, B. D. Gerardo, and N. V. Dionisio, "Plant disease detection and multi-class classification using deep learning architectures," in *Proc. IEEE Int. Conf. Comput. Sci. Inf. Technol. (ICCSIT)*, 2019, pp. 28–33.

[10] L. Li, S. Zhang, and B. Wang, "Plant disease detection and classification using image processing and deep learning techniques," *IEEE Access*, vol. 9, pp. 81920–81930, 2021.

[11] M. Brahimi, K. Boukhalfa, and A. Moussaoui, "Deep learning for plant diseases: Detection and saliency map visualization," *Human-centric Computing and Information Sciences*, vol. 7, no. 1, pp. 1–14, Dec. 2017.

[12] H. Durmuş, E. O. Güneş, and M. Kırcı, "Disease detection on the plant leaves using deep learning," in *Proc. 6th Int. Conf. Agro-Geoinformatics*, Fairfax, VA, USA, 2017, pp. 1–5.

[13] R. Sujatha, J. M. Chatterjee, J. Hassan, and S. J. Ramasamy, "A machine learning approach for crop yield prediction using climatological parameters," *Computational Intelligence and Neuroscience*, vol. 2021, pp. 1–11, 2021.

[14] N. Gandhi, O. Petkar, and L. J. Armstrong, "Rice crop yield prediction in India using machine learning techniques," in *Proc. 13th Int. Conf. Comput. Sci. Educ. (ICCSE)*, Colombo, Sri Lanka, 2018, pp. 581–586.

[15] Y. Van Klompenburg, A. Kassahun, and C. Catal, "Crop yield prediction using machine learning: A systematic literature review," *Computers and Electronics in Agriculture*, vol. 177, p. 105709, Oct. 2020.

[16] A. T. S. Gopal and R. S. S. Kumar, "Deep learning-based crop yield prediction and fertilizer recommendation system," *IEEE Transactions on AgriFood Electronics*, vol. 1, no. 2, pp. 112–120, Jun. 2023.

[17] M. Sandler, A. Howard, M. Menglong, A. Zhmoginov, and L. C. Chen, "MobileNetV2: Inverted residuals and linear bottlenecks," in *Proc. IEEE Conf. Comput. Vis. Pattern Recognit. (CVPR)*, Salt Lake City, UT, USA, 2018, pp. 4510–4520.

[18] G. Bradski, "The OpenCV Library," *Dr. Dobb's Journal of Software Tools*, vol. 25, no. 11, pp. 120–125, 2000.

[19] F. Pedregosa *et al.*, "Scikit-learn: Machine learning in Python," *Journal of Machine Learning Research*, vol. 12, pp. 2825–2830, 2011.

[20] L. Breiman, "Random forests," *Machine Learning*, vol. 45, no. 1, pp. 5–32, Oct. 2001.

[21] P. Ramirez and A. Sharma, "Application of HSV color space thresholding for automated lesion detection in agricultural computer vision," *Journal of Agricultural Informatics*, vol. 14, no. 3, pp. 45–58, 2022.

[22] Open-Meteo Weather API Documentation, "Historical and real-time weather forecast API," 2024. [Online]. Available: https://open-meteo.com

[23] Directorate of Marketing & Inspection (DMI), Ministry of Agriculture & Farmers Welfare, Govt. of India, "Agmarknet portal for agricultural produce market rates," 2024. [Online]. Available: https://agmarknet.gov.in

[24] S. S. Sankar and M. V. R. Murthy, "Analysis of deep learning model performance under domain shift in field plant diagnostics," *Computers and Electronics in Agriculture*, vol. 198, p. 107052, Jul. 2022.

[25] D. Hughes and M. Salathé, "An open access repository of plant leaves images for plant disease detection," *arXiv preprint arXiv:1511.08060*, 2015.

[26] P. Chattu and B. Nikhil, "Smart decision support frameworks for precision agriculture using computer vision and RESTful microservices," *International Journal of Agricultural and Biosystems Engineering*, vol. 18, no. 4, pp. 201–212, 2024.
