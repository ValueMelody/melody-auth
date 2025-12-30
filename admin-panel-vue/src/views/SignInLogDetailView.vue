<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Breadcrumb } from '@/components/layout'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { LoadingPage } from '@/components/shared'
import { useSignInLog } from '@/api/endpoints/logs'

const route = useRoute()
const { t } = useI18n()

const logId = computed(() => Number(route.params.id))

const { data: log, isLoading } = useSignInLog(logId)
</script>

<template>
  <div>
    <LoadingPage v-if="isLoading" />
    <template v-else-if="log">
      <Breadcrumb
        :page="'Log #' + log.id"
        :parent="{ href: '/logs?tab=signin', label: t('logs.signInLogs') }"
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-48">{{ t('common.property') }}</TableHead>
            <TableHead>{{ t('common.value') }}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>{{ log.id }}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell>{{ t('logs.userId') }}</TableCell>
            <TableCell>{{ log.userId }}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell>{{ t('logs.ip') }}</TableCell>
            <TableCell>{{ log.ip || '-' }}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell>{{ t('logs.detail') }}</TableCell>
            <TableCell>
              <pre v-if="log.detail" class="text-sm bg-muted p-2 rounded max-h-48 overflow-auto">{{ log.detail }}</pre>
              <span v-else>-</span>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>{{ t('common.createdAt') }}</TableCell>
            <TableCell>{{ log.createdAt }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </template>
  </div>
</template>
