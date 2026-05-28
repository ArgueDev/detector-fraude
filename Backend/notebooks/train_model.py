import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from sklearn.preprocessing import LabelEncoder
import joblib
import os

# Carga
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, '..', 'data', 'synthetic')

df_sin = pd.read_csv(os.path.join(DATA_DIR, 'siniestros.csv'))
df_pol = pd.read_csv(os.path.join(DATA_DIR, 'polizas.csv'))
df_ase = pd.read_csv(os.path.join(DATA_DIR, 'asegurados.csv'))

df = df_sin.merge(df_pol[['id_poliza', 'prima', 'suma_asegurada', 'deducible']],
                  on='id_poliza', how='left')
df = df.merge(df_ase[['id_asegurado', 'score_cliente', 'reclamos_ultimos_12_meses',
                       'antiguedad', 'mora_actual']],
              on='id_asegurado', how='left')

print(f"Total siniestros: {len(df)}")
print(f"Fraudes simulados: {df['etiqueta_fraude_simulada'].sum()}")

# Feature Engineering
df['ratio_monto_suma']      = df['monto_reclamado'] / (df['suma_asegurada'] + 1)
df['ratio_monto_estimado']  = df['monto_reclamado'] / (df['monto_estimado'] + 1)
df['borde_inicio']          = (df['dias_desde_inicio_poliza'] <= 30).astype(int)
df['borde_fin']             = (df['dias_desde_fin_poliza'] <= 30).astype(int)
df['reporte_tardio']        = (df['dias_entre_ocurrencia_reporte'] > 7).astype(int)
df['mora_actual']           = df['mora_actual'].astype(int)
df['documentos_completos']  = df['documentos_completos'].astype(int)

le_ramo      = LabelEncoder()
le_cobertura = LabelEncoder()
df['ramo_encoded']      = le_ramo.fit_transform(df['ramo'].fillna('Otro'))
df['cobertura_encoded'] = le_cobertura.fit_transform(df['cobertura'].fillna('Otro'))

features = [
    'monto_reclamado',
    'dias_desde_inicio_poliza',
    'dias_desde_fin_poliza',
    'dias_entre_ocurrencia_reporte',
    'historial_siniestros_asegurado',
    'score_cliente',
    'documentos_completos',
    'ratio_monto_suma',
    'ratio_monto_estimado',
    'borde_inicio',
    'borde_fin',
    'reporte_tardio',
    'ramo_encoded',
    'cobertura_encoded',
    'reclamos_ultimos_12_meses',
    'antiguedad',
    'mora_actual',
    'prima',
    'deducible',
]

X = df[features].copy().fillna(0)
y = df['etiqueta_fraude_simulada']

# Entrenamiento
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

rf_model = RandomForestClassifier(
    n_estimators=200,
    max_depth=12,
    min_samples_leaf=5,
    random_state=42,
    class_weight='balanced',
    n_jobs=-1
)

print("\nEntrenando modelo...")
rf_model.fit(X_train, y_train)

# Métricas de evaluación
y_pred  = rf_model.predict(X_test)
y_proba = rf_model.predict_proba(X_test)[:, 1]

print("\n=== Confusion Matrix ===")
print(confusion_matrix(y_test, y_pred))
print("\n=== Classification Report ===")
print(classification_report(y_test, y_pred))
print(f"\n=== AUC-ROC: {roc_auc_score(y_test, y_proba):.4f} ===")

cv_scores = cross_val_score(rf_model, X, y, cv=5, scoring='roc_auc')
print(f"\n=== Cross-Val AUC-ROC (5-fold): {cv_scores.mean():.4f} ± {cv_scores.std():.4f} ===")

importances = pd.Series(rf_model.feature_importances_, index=features)
print("\n=== Top 10 Features más importantes ===")
print(importances.sort_values(ascending=False).head(10))

# Exportar modelo y encoders
MODEL_DIR = os.path.join(BASE_DIR, '..', 'app', 'model')
os.makedirs(MODEL_DIR, exist_ok=True)

joblib.dump(rf_model,    os.path.join(MODEL_DIR, 'random_forest_fraud.joblib'))
joblib.dump(features,    os.path.join(MODEL_DIR, 'model_features.joblib'))
joblib.dump(le_ramo,     os.path.join(MODEL_DIR, 'le_ramo.joblib'))
joblib.dump(le_cobertura,os.path.join(MODEL_DIR, 'le_cobertura.joblib'))

print("\nModelo y encoders exportados correctamente en app/model/")