from fastapi import FastAPI

app = FastAPI(title='Detector de Fraudes')

@app.get('/')
def root():
    return {'message': 'API funcionando', 'status': 'Ok'}

@app.get('/salud')
def salud():
    return {'status': 'Salud', 'database': 'conectada'}