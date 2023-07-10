from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/voz')
def voz():
    return render_template('voz.html')

@app.route('/gestos')
def gestos():
    return render_template('gestos.html')

if __name__ == '__main__':
    app.run(debug=True)