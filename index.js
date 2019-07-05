const { pow } = require('./proof-of-work');

const difficulty = 1
const pubKey = "054289f00bdf4a773166debb90fb42e80907e52983b5575c7e8a28135e7426a933";
const data = "CAESwQIKA1BVVBIPL2FwaS92MS9tZXNzYWdlGqUCCAESQjA1ODEzMWY2MDU0Mzg1NDdiZjA0Yzg4NTg3ZmQyYmIwZmJkZGMwOTE1NmMxNGJlODI4MzIzMDExY2YwNTk1ZTY3NjgBKKHK64e8LULTATMKIQV8KkkDsuAwjyG1ARe5917bRMLDg/EJXgmbtGLOB1fVARABGAEioAH2IMK5jmhe9CKl79Diu/D0iRj2VpZI9ll2/qJeqstW7/YaIzeat2GReoJO9f5seI2o6PFRjsL6W8jOFJM2J5x+A/9xtEQCAfyx8kotk6HoJOXeQdsD7nkZkJK2vEmbdb+wfe/mufbPNnEAoHZ/9vJRtLqkbuu89Dx+F5Jwt4qrsC2uLIu30LpaXOIINec/exJZdLuCHGdGlDYuWSop5XJvlAp8fFpozGEgxwE="
const timestamp = 1562310796711
const ttl = 43200000

const start = async () => {
  const nonce = await pow.calcPoW(timestamp, ttl, pubKey, data, difficulty);
  console.log(nonce)
}

start();
