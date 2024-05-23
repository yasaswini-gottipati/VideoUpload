import { View, Text, Image, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { icons } from '../constants'
import { Video,ResizeMode } from 'expo-av'
import { useGlobalContext } from '../context/GlobalProvider'
import { updateVideo } from '../lib/appwrite'

const VideoCard = ({video:{$id:docId,title,thumbnail,prompt,video,creator:{username,avatar}}}) => {
    const {user}=useGlobalContext();
    let userId=user?.$id
    const [play,setPlay]=useState(false)
    const helper=async(docId,title,thumbnail,prompt,video,userId)=>{
        try{
        await updateVideo(docId,title,thumbnail,prompt,video,userId)
        }catch(error){
            Alert.alert("Error",error.message)
        }
    }
  return (
    <View className='flex-col items-center px-4 mb-14'>
        <View className='flex-row gap-3 items-start'>
            <View className='justify-center items-center flex-row flex-1'>
                <View className='w-[46px] h-[46px] rounded-lg border border-secondary justify-center items-center p-0.5'>
                    <Image 
                    source={{uri:avatar}}
                    className='w-full h-full rounded-lg'
                    resizeMode='contain'
                    />
                </View>
                <View className='justify-center flex-1 ml-3 gap-y-1'>
                    <Text className='text-white font-psemibold text-sm' numberOfLines={1}>
                        {title}
                    </Text>
                    <Text className='text-gray-100 font-pregular text-xs' numberOfLines={1}>
                        {username}
                    </Text>
                </View>
            </View>
            <View className='pt-2'>
            <TouchableOpacity 
            activeOpacity={0.7}
            onPress={()=>  Alert.alert('Save Video', 'Do you want to save this video?', [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {text: 'Save', onPress: () => helper(docId,title,thumbnail,prompt,video,userId)},
              ])}
            >
                <Image 
                    source={icons.menu}
                    className='w-5 h-5'
                    resizeMode='contain'
                />
            </TouchableOpacity>
            </View>
        </View>
        {play ? (<Video 
            source={{uri:video}}
            className='w-full h-60 rounded-xl mt-3 '
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls
            shouldPlay
            onPlaybackStatusUpdate={(status)=>{
                if(status.didJustFinish){
                    setPlay(false)
                }
            }}
            />):(
            <TouchableOpacity 
            activeOpacity={0.7}
            onPress={()=> setPlay(true)}
            className='w-full h-60 rounded-xl mt-3 relative justify-center items-center '>
                <Image 
                source={{uri:thumbnail}}
                className='w-full h-full rounded-xl mt-3'
                resizeMode='cover'
                />
                <Image 
                source={icons.play}
                className='w-12 h-12 absolute'
                resizeMode='contain'
                />
            </TouchableOpacity>
        )}
    </View>
  )
}

export default VideoCard