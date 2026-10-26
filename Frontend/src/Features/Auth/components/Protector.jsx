import { Navigate } from "react-router-dom";
import { UseAuth } from "../hook/UseAuth";

import React from 'react'

 const Protector = ({ children }) => {

  const { loading, user } = UseAuth()

  if (loading) {
    return <div>Loading...</div>
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return (
    children
  )
}


export default Protector