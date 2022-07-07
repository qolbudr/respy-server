const express = require('express')
const axios = require("axios")
const app = express()
const port = 3000

app.get('/', async (req, res) => {
  const randomString = (length) => {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result
  }

  const getRegisterData = async () => {
    const email = "printed-network-" + randomString(10) + "@mailsac.com"
    const response = await axios.post('https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=AIzaSyA9dhp5-AKka4EtVGO_JBG7bM8mplA0WlE', {
      email: email,
      password: randomString(20),
      returnSecureToken: true
    })
    return response.data
  }

  const createUser = async (email, localId) => {
    const response = await axios.post('https://workshop.simsimi.com/api/user', {
      email: email,
      uuid: localId
    })

    return response.data
  }

  const getApiKey = async (localId) => {
    const response = await axios.get('https://workshop.simsimi.com/api/project?uuid=' + localId)
    return response.data
  }

  const registerData = await getRegisterData()
  const user = await createUser(registerData.email, registerData.localId)
  const apiKeyData = await getApiKey(registerData.localId)
  res.send(apiKeyData[0].apiKey)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})