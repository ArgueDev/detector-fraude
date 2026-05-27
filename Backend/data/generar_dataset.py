import pandas as pd
import numpy as np
from faker import Faker
from datetime import datetime, timedelta
import random, os

fake = Faker('es_MX')
np.random.seed(42)
random.seed(42)

N_SINIEST     = 500
N_POLIZAS     = 300
N_ASEGURADOS  = 200
N_PROVEEDORES = 40
FRAUDE_RATIO  = 0.15

RAMOS      = ['Vehiculos', 'Salud', 'Vida', 'Hogar', 'Generales']
COBERTURAS = ['Choque', 'Robo', 'Atencion Medica', 'Incendio', 'Dano', 'Responsabilidad Civil']
ESTADOS    = ['Reserva', 'Pago Total', 'Pago Parcial', 'Anticipo',
              'Negativa', 'Cierre Sin Consecuencia', 'Liquidado']
SUCURSALES = ['Quito Norte', 'Quito Sur', 'Guayaquil', 'Cuenca', 'Ambato', 'Manta']
CIUDADES   = ['Quito', 'Guayaquil', 'Cuenca', 'Ambato', 'Manta', 'Loja', 'Ibarra']
LISTA_REST = []

def rand_date(start_days_ago=730, end_days_ago=0):
    return datetime.now() - timedelta(days=random.randint(end_days_ago, start_days_ago))

def rand_amount(base, spread=0.4):
    return round(base * (1 + np.random.uniform(-spread, spread)), 2)

# ── Asegurados ──────────────────────────────────────────────────
asegurados = [{
    'id_asegurado':              f'ASE-{i+1:04d}',
    'segmento':                  random.choice(['Natural', 'Juridico']),
    'antiguedad':                random.randint(1, 15),
    'ciudad':                    random.choice(CIUDADES),
    'numero_polizas':            random.randint(1, 4),
    'reclamos_ultimos_12_meses': 0,
    'mora_actual':               random.choice([True, False]),
    'score_cliente':             random.randint(40, 100),
} for i in range(N_ASEGURADOS)]
df_ase = pd.DataFrame(asegurados)

# ── Proveedores ─────────────────────────────────────────────────
proveedores = []
for i in range(N_PROVEEDORES):
    en_lista = (i < 3)
    if en_lista:
        LISTA_REST.append(f'PROV-{i+1:03d}')
    proveedores.append({
        'id_proveedor':                f'PROV-{i+1:03d}',
        'tipo':                        random.choice(['Taller', 'Clinica', 'Perito', 'Legal']),
        'ciudad':                      random.choice(CIUDADES),
        'reclamos_asociados':          random.randint(1, 50),
        'monto_promedio_reclamado':    rand_amount(3000),
        'porcentaje_casos_observados': round(random.uniform(0, 0.4), 3),
        'antiguedad':                  random.randint(1, 20),
        'en_lista_restrictiva':        en_lista,
    })
df_prov = pd.DataFrame(proveedores)

# ── Pólizas ─────────────────────────────────────────────────────
polizas = []
for i in range(N_POLIZAS):
    inicio = rand_date(1095, 30)
    fin    = inicio + timedelta(days=365)
    polizas.append({
        'id_poliza':      f'POL-{i+1:05d}',
        'id_asegurado':   random.choice(df_ase['id_asegurado'].tolist()),
        'ramo':           random.choice(RAMOS),
        'fecha_inicio':   inicio.date(),
        'fecha_fin':      fin.date(),
        'prima':          rand_amount(1200, 0.6),
        'suma_asegurada': rand_amount(30000, 0.5),
        'deducible':      rand_amount(500, 0.3),
        'canal_venta':    random.choice(['Agente', 'Broker', 'Digital', 'Directo']),
        'ciudad':         random.choice(CIUDADES),
        'estado_poliza':  random.choice(['Vigente', 'Vencida', 'Cancelada']),
    })
df_pol = pd.DataFrame(polizas)

# ── Narrativas ──────────────────────────────────────────────────
NARRATIVAS = [
    "El vehiculo fue impactado por detras mientras estaba detenido en un semaforo.",
    "Se produjo un choque lateral al cambiar de carril en la autopista.",
    "El asegurado reporta dano en la parte frontal tras colision con poste.",
    "Incendio en cocina del hogar asegurado por descuido con gas.",
    "Robo del vehiculo en estacionamiento publico durante la madrugada.",
    "Dano por inundacion en el sotano de la propiedad asegurada.",
    "Colision en interseccion por semaforo en rojo del tercero.",
    "Caida de arbol sobre el vehiculo estacionado por tormenta.",
]
NARRATIVA_CLONADA = (
    "El vehiculo colisiono frontalmente con otro en la avenida principal, "
    "el tercero se dio a la fuga sin dejar datos."
)

def gen_narrativa(tipo):
    if tipo == 'narrativa_clonada':
        return NARRATIVA_CLONADA
    if tipo == 'dinamica_ilogica':
        return "El vehiculo sufrio dano severo en la parte trasera pero el impacto fue frontal."
    return random.choice(NARRATIVAS)

# ── Siniestros ──────────────────────────────────────────────────
TIPOS_FRAUDE = ['borde_vigencia', 'demora_robo', 'frecuencia',
                'proveedor_lista', 'narrativa_clonada', 'documentos', 'reporte_tardio']
siniestros = []
hist_ase   = {}

for i in range(N_SINIEST):
    pol     = df_pol.sample(1).iloc[0]
    ase_id  = pol['id_asegurado']
    es_fraude   = random.random() < FRAUDE_RATIO
    tipo_fraude = random.choice(TIPOS_FRAUDE) if es_fraude else ''

    f_inicio = datetime.combine(pol['fecha_inicio'], datetime.min.time())
    f_fin    = datetime.combine(pol['fecha_fin'],    datetime.min.time())

    if es_fraude and tipo_fraude == 'borde_vigencia':
        dias_inicio = random.randint(1, 10)
    else:
        dias_inicio = random.randint(30, 320)

    f_ocu    = min(f_inicio + timedelta(days=dias_inicio), f_fin - timedelta(days=1))
    dias_fin = max((f_fin - f_ocu).days, 0)

    if es_fraude and tipo_fraude == 'reporte_tardio':
        dias_rep = random.randint(8, 20)
    elif es_fraude and tipo_fraude == 'demora_robo':
        dias_rep = random.randint(5, 10)
    else:
        dias_rep = random.randint(0, 3)
    f_rep = f_ocu + timedelta(days=dias_rep)

    suma      = float(pol['suma_asegurada'])
    monto_rec = rand_amount(suma * 0.97, 0.02) if (es_fraude and tipo_fraude == 'frecuencia') \
                else rand_amount(suma * 0.35, 0.4)
    monto_est = round(monto_rec * random.uniform(0.8, 1.1), 2)
    monto_pag = round(monto_rec * random.uniform(0.7, 1.0), 2) if random.random() > 0.3 else 0.0

    if es_fraude and tipo_fraude == 'proveedor_lista' and LISTA_REST:
        prov_id = random.choice(LISTA_REST)
    else:
        prov_id = random.choice(df_prov['id_proveedor'].tolist())

    hist = hist_ase.get(ase_id, 0)
    hist_ase[ase_id] = hist + 1
    if es_fraude and tipo_fraude == 'frecuencia':
        hist = random.randint(3, 6)

    siniestros.append({
        'id_siniestro':                  f'SIN-{i+1:05d}',
        'id_poliza':                     pol['id_poliza'],
        'id_asegurado':                  ase_id,
        'ramo':                          pol['ramo'],
        'cobertura':                     random.choice(COBERTURAS),
        'fecha_ocurrencia':              f_ocu.date(),
        'fecha_reporte':                 f_rep.date(),
        'monto_reclamado':               round(monto_rec, 2),
        'monto_estimado':                monto_est,
        'monto_pagado':                  monto_pag,
        'estado':                        random.choice(ESTADOS),
        'sucursal':                      random.choice(SUCURSALES),
        'descripcion':                   gen_narrativa(tipo_fraude),
        'documentos_completos':          not (es_fraude and tipo_fraude == 'documentos'),
        'beneficiario':                  prov_id,
        'dias_desde_inicio_poliza':      dias_inicio,
        'dias_desde_fin_poliza':         dias_fin,
        'dias_entre_ocurrencia_reporte': dias_rep,
        'historial_siniestros_asegurado': hist,
        'score_riesgo':                  0,
        'nivel_riesgo':                  'Verde',
        'alertas_activadas':             '',
        'etiqueta_fraude_simulada':      1 if es_fraude else 0,
    })

df_sin = pd.DataFrame(siniestros)

# ── Documentos ──────────────────────────────────────────────────
TIPOS_DOC = ['Denuncia Policial', 'Factura Reparacion', 'Informe Perito',
             'Foto Evidencia', 'Cedula Asegurado', 'Certificado Medico']
documentos = []
doc_id = 1
for _, sin in df_sin.iterrows():
    for tipo in random.sample(TIPOS_DOC, random.randint(2, 5)):
        inconsistencia = (not sin['documentos_completos'] and random.random() < 0.5)
        documentos.append({
            'id_documento':             f'DOC-{doc_id:06d}',
            'id_siniestro':             sin['id_siniestro'],
            'tipo_documento':           tipo,
            'entregado':                bool(sin['documentos_completos']),
            'legible':                  random.random() > 0.1,
            'fecha_emision':            sin['fecha_ocurrencia'],
            'inconsistencia_detectada': inconsistencia,
            'observacion':              fake.sentence(nb_words=6) if inconsistencia else '',
        })
        doc_id += 1
df_doc = pd.DataFrame(documentos)

# ── Guardar CSVs ─────────────────────────────────────────────────
os.makedirs('data/synthetic', exist_ok=True)

df_ase.to_csv('data/synthetic/asegurados.csv',   index=False)
df_prov.to_csv('data/synthetic/proveedores.csv', index=False)
df_pol.to_csv('data/synthetic/polizas.csv',      index=False)
df_sin.to_csv('data/synthetic/siniestros.csv',   index=False)
df_doc.to_csv('data/synthetic/documentos.csv',   index=False)

print("Dataset generado:")
print(f"  Siniestros : {len(df_sin)}  |  Fraudes: {df_sin['etiqueta_fraude_simulada'].sum()}")
print(f"  Polizas    : {len(df_pol)}")
print(f"  Asegurados : {len(df_ase)}")
print(f"  Proveedores: {len(df_prov)}  |  Lista restrictiva: {len(LISTA_REST)}")
print(f"  Documentos : {len(df_doc)}")