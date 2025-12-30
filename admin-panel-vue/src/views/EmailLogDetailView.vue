<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Breadcrumb } from '@/components/layout'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { LoadingPage } from '@/components/shared'
import { useEmailLog } from '@/api/endpoints/logs'

const route = useRoute()
const { t } = useI18n()

const logId = computed(() => Number(route.params.id))

const { data: log, isLoading } = useEmailLog(logId)
</script>

<template>
  <div>
    <LoadingPage v-if="isLoading" />
    <template v-else-if="log">
      <Breadcrumb
        :page="'Log #' + log.id"
        :parent="{ href: '/logs?tab=email', label: t('logs.emailLogs') }"
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
            <TableCell>{{ t('common.status') }}</TableCell>
            <TableCell>
              <Badge :variant="log.success ? 'default' : 'destructive'">
                {{ log.success ? t('logs.success') : t('logs.failed') }}
              </Badge>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>{{ t('logs.receiver') }}</TableCell>
            <TableCell>{{ log.receiver }}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell>{{ t('logs.response') }}</TableCell>
            <TableCell>
              <pre class="text-sm bg-muted p-2 rounded max-h-48 overflow-auto">{{ log.response }}</pre>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>{{ t('logs.content') }}</TableCell>
            <TableCell>
              <pre class="text-sm bg-muted p-2 rounded max-h-96 overflow-auto">{{ log.content }}</pre>
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
