<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  const code = route.query.code as string | undefined
  if (code) {
    await authStore.handleCallback(code)
    await authStore.fetchUserInfo()
    router.push('/dashboard')
  }
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center">
    <Card class="w-[350px]">
      <CardHeader>
        <CardTitle>Admin Panel</CardTitle>
      </CardHeader>
      <CardContent>
        <Button @click="authStore.login()" class="w-full">
          Sign In
        </Button>
      </CardContent>
    </Card>
  </div>
</template>
