import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true
})
export async function Register({ Fullname , email, password}) {
    try {
        const response = await api.post("/api/auth/register", {
            Fullname,
            email,
            password
        })
        return response.data
    } catch (err) {
       throw err
    }
}

export async function Login({ email, password }) {
    try {
        const response = await api.post("/api/auth/login", {
            email,
            password
        })
        return response.data
    }
    catch (err) {
        console.log(err)
      throw err
    }
}

export async function Logout() {
    try {
        const response = await api.post('/api/auth/logout')
        return response.data
    } catch (err) {
        console.log(err)
       throw err
    }

}
export async function GetMe() {
try{
        const response = await api.get('/api/auth/getme')
    return response.data
}catch(err){
    console.log(err)
    throw err
}
}