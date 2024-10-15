import React from 'react'
import './Progress.scss'
export default function Progress({progress}) {
    const Parentdiv = {
        height: '10px',
        width: '100%',
        backgroundColor: 'whitesmoke',
        borderRadius: 40,
      }
      
      const Childdiv = {
        height: '100%',
        width: `${progress}%`,
        backgroundColor: 'green',
       borderRadius:40,
        textAlign: 'right'
      }
      
      const progresstext = {
        padding: 10,
        color: 'black',
        fontWeight: 900
      }
        
    return (
    <div style={Parentdiv}>
      <div style={Childdiv}>
        <span style={progresstext}> <p>{`${progress}%`}</p> </span>
      </div>
    </div>
    )
}
