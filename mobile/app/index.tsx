import { View, Text, Button } from 'react-native'
import React from 'react'
import { useClerk } from '@clerk/clerk-expo'

const index = () => {
    const {signOut} = useClerk()
  return (
    <View>
      <Text>Welcome to chatx</Text>
      <Button onPress={()=>{signOut()}} title='Logout'></Button>
    </View>
  )
}

export default index