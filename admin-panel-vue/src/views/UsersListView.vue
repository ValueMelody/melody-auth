<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDebounceFn } from '@vueuse/core'
import { PageTitle } from '@/components/layout'
import { AppPagination, EntityStatusLabel, LoadingPage } from '@/components/shared'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { useUsers } from '@/api/endpoints/users'
import { useAuthStore } from '@/stores/auth'
import { Pencil } from 'lucide-vue-next'

const PAGE_SIZE = 20

const { t } = useI18n()
const authStore = useAuthStore()

const searchInput = ref('')
const debouncedSearch = ref('')
const pageNumber = ref(1)

const params = computed(() => ({
  pageSize: PAGE_SIZE,
  pageNumber: pageNumber.value,
  search: debouncedSearch.value || undefined
}))

const { data, isLoading } = useUsers(params)

const users = computed(() => data.value?.users ?? [])
const totalCount = computed(() => data.value?.count ?? 0)
const totalPages = computed(() => Math.ceil(totalCount.value / PAGE_SIZE))

const updateSearch = useDebounceFn((value: string) => {
  debouncedSearch.value = value
  pageNumber.value = 1
}, 300)

watch(searchInput, (value) => {
  updateSearch(value)
})

function handlePageChange(page: number) {
  pageNumber.value = page
}
</script>

<template>
  <div>
    <PageTitle :title="t('users.title')" />

    <LoadingPage v-if="isLoading" />

    <template v-else>
      <header class="mb-6 flex items-center gap-4">
        <Input
          v-model="searchInput"
          class="w-60"
          :placeholder="t('users.search')"
        />
      </header>

      <Alert v-if="users.length === 0">
        <AlertDescription>{{ t('users.noUsers') }}</AlertDescription>
      </Alert>

      <Table v-else>
        <TableHeader>
          <TableRow>
            <TableHead>{{ t('users.authId') }}</TableHead>
            <TableHead>{{ t('users.email') }}</TableHead>
            <TableHead>{{ t('users.status') }}</TableHead>
            <TableHead>{{ t('users.name') }}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="user in users" :key="user.id">
            <TableCell>
              <div class="flex items-center gap-2">
                {{ user.authId }}
                <span v-if="user.authId === authStore.userInfo?.authId"
                      class="text-xs text-muted-foreground">({{ t('users.you') }})</span>
              </div>
            </TableCell>
            <TableCell>{{ user.email }}</TableCell>
            <TableCell>
              <EntityStatusLabel :is-active="user.isActive" />
            </TableCell>
            <TableCell>
              {{ [user.firstName, user.lastName].filter(Boolean).join(' ') }}
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="icon" as-child>
                <router-link :to="'/users/' + user.authId">
                  <Pencil class="size-4" />
                </router-link>
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <AppPagination
        v-if="totalPages > 1"
        :current-page="pageNumber"
        :total-pages="totalPages"
        @page-change="handlePageChange"
      />
    </template>
  </div>
</template>
