const BASE_URL = 'http://localhost:3001/api'

export const api = {
    get: async (endpoint) => {

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            credentials: 'include' // tells browser to send httpOnly cookie with every request
        })

        return response.json()
    },

    post: async (endpoint, data)=> {

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        })

        return response.json()
    },

    put: async (endpoint, data)=> {

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        })

        return response.json()
    },

    delete: async (endpoint)=> {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'DELETE',
            credentials: 'include'
        })

        return response.json()
    }
}