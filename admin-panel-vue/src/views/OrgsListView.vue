<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { PageTitle } from '@/components/layout'
import { CreateButton, LoadingPage } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { useOrgs } from '@/api/endpoints/orgs'
import { Pencil } from 'lucide-vue-next'

const { t } = useI18n()
const { data, isLoading } = useOrgs()

const orgs = computed(() => data.value ?? [])
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <PageTitle :title="t('orgs.title')" class="mb-0" />
      <CreateButton to="/orgs/new" :label="'orgs.new'" />
    </div>

    <LoadingPage v-if="isLoading" />

    <Table v-else>
      <TableHeader>
        <TableRow>
          <TableHead>{{ t('orgs.name') }}</TableHead>
          <TableHead>{{ t('orgs.slug') }}</TableHead>
          <TableHead>{{ t('orgs.allowPublicRegistration') }}</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="org in orgs" :key="org.id">
          <TableCell>{{ org.name }}</TableCell>
          <TableCell class="font-mono text-sm">{{ org.slug }}</TableCell>
          <TableCell>
            <Badge :variant="org.allowPublicRegistration ? 'default' : 'secondary'">
              {{ org.allowPublicRegistration ? t('common.enable') : t('common.disable') }}
            </Badge>
          </TableCell>
          <TableCell>
            <Button variant="ghost" size="icon" as-child>
              <router-link :to="'/orgs/' + org.id">
                <Pencil class="size-4" />
              </router-link>
            </Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
