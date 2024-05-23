import { View, RefreshControl, FlatList, TouchableOpacity, Image} from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import EmptyState from '../../components/EmptyState'
import { getUserPosts, bookmarkPosts, signOut } from '../../lib/appwrite'
import useAppWrite from '../../lib/useAppWrite'
import VideoCard from '../../components/VideoCard'
import { useGlobalContext } from '../../context/GlobalProvider'
import { icons } from '../../constants'
import InfoBox from '../../components/InfoBox'
import { router } from 'expo-router'


const Profile = () => {
  const {user,setUser,setIsLoggedIn}=useGlobalContext();
  const { data: posts } = useAppWrite(()=>getUserPosts(user.$id));
  const { data: saved, refetch } = useAppWrite(()=>bookmarkPosts(user.$id));
  const [refreshing,setRefreshing]=useState(false)

const logout=async()=>{
  await signOut();
  setUser(null)
  setIsLoggedIn(false)
  router.replace('/sign-in')
}

const onRefresh =async() =>{
  setRefreshing(true);
  await refetch();
  setRefreshing(false);
}
  
  return (
    <SafeAreaView className='bg-primary h-full'>
    <FlatList 
      data={posts}
      keyExtractor={(item)=>item.$id}
      renderItem={({item})=>(
        <VideoCard video={item} />
      )}
      ListHeaderComponent={() => (
        <View className='w-full justify-center items-center mt-6 mb-12 px-4'>
          <TouchableOpacity
          className='w-full items-end mb-10'
          onPress={logout}
          >
            <Image 
            source={icons.logout}
            resizeMode='contain'
            className='w-6 h-6'
            />
          </TouchableOpacity>
          <View className='w-16 h-16 border border-secondary rounded-lg justify-center items-center'>
              <Image 
              source={{uri:user?.avatar}}
              className='w-[90%] h-[90%] rounded-lg'
              resizeMode='contain'  
              />
          </View>
          <InfoBox 
            title={user?.username}
            containerStyles='mt-5'
            titleStyles='text-lg'
          />
          <View className='mt-5 flex-row'>
          <InfoBox 
            title={posts.length || 0}
            subtitle='Posts'
            containerStyles='mr-10'
            titleStyles='text-xl'
          />
          <InfoBox 
            title={saved.length || 0}
            subtitle='Bookmarks'
            titleStyles='text-xl'
          />
          </View>
        </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="No videos found for this search query"
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    />
    </SafeAreaView>
  )
}

export default Profile