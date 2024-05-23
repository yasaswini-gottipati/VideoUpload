import { View, TextInput, TouchableOpacity, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import {icons} from '../constants'
import { router, usePathname } from 'expo-router'

const SearchInput = ({initialQuery,placeholder,saved}) => {
    const pathname=usePathname();
    const [query,setQuery]=useState(initialQuery || '')
  return (
    <View 
      className='border-2 border-black-200 w-full 
      h-16 px-4 bg-black-100 rounded-2xl focus:border-secondary flex flex-row items-center space-x-4' >
        <TextInput 
            className='flex-1 text-white text-base mt-0.5 font-pregular'
            value={query}
            placeholder={placeholder||'Search for a video topic'}
            placeholderTextColor='#CDCDE0'
            onChangeText={(e)=>setQuery(e)} 
        />
        {saved?(
          <TouchableOpacity
          onPress={()=>{
            if(!query){
              Alert.alert('Missing Query',"please input something to search results across database")
            }
            if(pathname.startsWith('/search/saved')){
              router.setParams({query})
            }else{
              router.push(`/search/saved/${query}`)
            }
          }} 
          >
              <Image 
                  source={icons.search}
                  className='w-5 h-5'
                  resizeMode='contain'
              />
          </TouchableOpacity>
        ) :(<TouchableOpacity
        onPress={()=>{
          if(!query){
            Alert.alert('Missing Query',"please input something to search results across database")
          }
          if(pathname.startsWith('/search')){
            router.setParams({query})
          }else{
            router.push(`/search/${query}`)
          }
        }} 
        >
            <Image 
                source={icons.search}
                className='w-5 h-5'
                resizeMode='contain'
            />
        </TouchableOpacity>)}
      </View>
  )
}

export default SearchInput