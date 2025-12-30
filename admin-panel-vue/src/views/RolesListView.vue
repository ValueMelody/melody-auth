<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { PageTitle } from '@/components/layout'
import { CreateButton, LoadingPage } from '@/components/shared'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { useRoles } from '@/api/endpoints/roles'
import { Pencil } from 'lucide-vue-next'

const { t } = useI18n()
const { data, isLoading } = useRoles()

const roles = computed(() => data.value ?? [])
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <PageTitle :title="t('roles.title')" class="mb-0" />
      <CreateButton to="/roles/new" :label="'roles.new'" />
    </div>

    <LoadingPage v-if="isLoading" />

    <Table v-else>
      <TableHeader>
        <TableRow>
          <TableHead>{{ t('roles.name') }}</TableHead>
          <TableHead>{{ t('common.note') }}</TableHead>
          <TableHead>{{ t('common.createdAt') }}</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="role in roles" :key="role.id">
          <TableCell>{{ role.name }}</TableCell>
          <TableCell>{{ role.note }}</TableCell>
          <TableCell>{{ new Date(role.createdAt).toLocaleDateString() }}</TableCell>
          <TableCell>
            <Button variant="ghost" size="icon" as-child>
              <router-link :to="'/roles/' + role.id">
                <Pencil class="size-4" />
              </router-link>
            </Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
