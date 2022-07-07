const express = require('express')
const axios = require("axios")
const fs = require('fs')
const app = express()
const port = 3000
const path = require('path')

app.use(express.static(path.join(__dirname, 'public')))

app.get('/:text', async (req, res) => {
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

  const enableProject = async (puid) => {
    const response = await axios.put('https://workshop.simsimi.com/api/project/enable', {
      puid: puid
    })

    return response.data;
  }

  const writeApiKey = async () => {
    const registerData = await getRegisterData()
    const user = await createUser(registerData.email, registerData.localId)
    const apiKeyData = await getApiKey(registerData.localId)
    await enableProject(apiKeyData[0].puid)
    const content = {
      apiKey: apiKeyData[0].apiKey,
      quota: 0
    }

    const data = JSON.stringify(content)

    fs.writeFile(path.join(__dirname, 'public/data.json'), data, err => {
      if (err) {
        console.error(err)
      }
    });
  }

  const getReply = async (apiKey, text) => {
    try {
      const response = await axios.post('https://wsapi.simsimi.com/190410/talk', {
        utext: text,
        lang: 'id'
      },
      {
        headers: {
          'x-api-key': apiKey
        }
      })
      return response.data
    } catch(e) {
      console.log(e)
    }
  }

  const data = await fs.readFileSync(path.join(__dirname, 'public/data.json'), {encoding: 'utf8'});
  const json = JSON.parse(data)
  const response = await getReply(json.apiKey, req.params.text)
  if(response.hasOwnProperty('atext')) {
    const quota = json.quota + 1

    if(quota < 99) {
      const content = {
        apiKey: json.apiKey,
        quota: quota
      }

      const data = JSON.stringify(content)

      fs.writeFile(path.join(__dirname, 'public/data.json'), data, err => {
        if (err) {
          console.error(err)
        }
      });
    } else {
      await writeApiKey();
    }
    if(response.status == 200) {
      res.send(response.atext)
    } else {
      res.send('Not Understandable')
    }
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})