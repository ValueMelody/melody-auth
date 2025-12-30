<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { PageTitle } from '@/components/layout'
import { CreateButton, LoadingPage } from '@/components/shared'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { useUserAttributes } from '@/api/endpoints/userAttributes'
import { Pencil, Check, X } from 'lucide-vue-next'

const { t } = useI18n()
const { data, isLoading } = useUserAttributes()

const attributes = computed(() => data.value ?? [])
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <PageTitle :title="t('userAttributes.title')" class="mb-0" />
      <CreateButton to="/user-attributes/new" :label="'userAttributes.new'" />
    </div>

    <LoadingPage v-if="isLoading" />

    <Table v-else>
      <TableHeader>
        <TableRow>
          <TableHead>{{ t('userAttributes.name') }}</TableHead>
          <TableHead>{{ t('userAttributes.includeInSignUpForm') }}</TableHead>
          <TableHead>{{ t('userAttributes.requiredInSignUpForm') }}</TableHead>
          <TableHead>{{ t('userAttributes.uniqueAttribute') }}</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="attr in attributes" :key="attr.id">
          <TableCell>{{ attr.name }}</TableCell>
          <TableCell>
            <Check v-if="attr.includeInSignUpForm" class="size-4 text-green-500" />
            <X v-else class="size-4 text-muted-foreground" />
          </TableCell>
          <TableCell>
            <Check v-if="attr.requiredInSignUpForm" class="size-4 text-green-500" />
            <X v-else class="size-4 text-muted-foreground" />
          </TableCell>
          <TableCell>
            <Check v-if="attr.unique" class="size-4 text-green-500" />
            <X v-else class="size-4 text-muted-foreground" />
          </TableCell>
          <TableCell>
            <Button variant="ghost" size="icon" as-child>
              <router-link :to="'/user-attributes/' + attr.id">
                <Pencil class="size-4" />
              </router-link>
            </Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
