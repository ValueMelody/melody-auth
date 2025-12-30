<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { PageTitle } from '@/components/layout'
import { CreateButton, ClientTypeLabel, LoadingPage } from '@/components/shared'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { useScopes } from '@/api/endpoints/scopes'
import { Pencil } from 'lucide-vue-next'

const { t } = useI18n()
const { data, isLoading } = useScopes()

const scopes = computed(() => data.value ?? [])
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <PageTitle :title="t('scopes.title')" class="mb-0" />
      <CreateButton to="/scopes/new" :label="'scopes.new'" />
    </div>

    <LoadingPage v-if="isLoading" />

    <Table v-else>
      <TableHeader>
        <TableRow>
          <TableHead>{{ t('scopes.name') }}</TableHead>
          <TableHead>{{ t('scopes.type') }}</TableHead>
          <TableHead>{{ t('common.note') }}</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="scope in scopes" :key="scope.id">
          <TableCell>{{ scope.name }}</TableCell>
          <TableCell>
            <ClientTypeLabel :type="scope.type" />
          </TableCell>
          <TableCell>{{ scope.note }}</TableCell>
          <TableCell>
            <Button variant="ghost" size="icon" as-child>
              <router-link :to="'/scopes/' + scope.id">
                <Pencil class="size-4" />
              </router-link>
            </Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
