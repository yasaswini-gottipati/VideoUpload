import { View, Text, FlatList, RefreshControl} from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import SearchInput from '../../components/SearchInput'
import EmptyState from '../../components/EmptyState'
import { bookmarkPosts } from '../../lib/appwrite'
import useAppWrite from '../../lib/useAppWrite'
import VideoCard from '../../components/VideoCard'
import { useGlobalContext } from '../../context/GlobalProvider'

const Bookmark = () => {
  const {user}=useGlobalContext();
  const { data: posts, refetch } = useAppWrite(()=>bookmarkPosts(user.$id));
  const [refreshing,setRefreshing]=useState(false)

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
        <View className="flex my-6 px-4 space-y-6">
            <View className="flex my-6 px-4">
              <Text className="text-2xl font-psemibold text-white">
                Saved Videos
              </Text>
          </View>
          <SearchInput placeholder={'Search your saved videos'} saved={true} />
        </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="Please save a video to find"
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    />
    </SafeAreaView>
  )
}

export default Bookmark