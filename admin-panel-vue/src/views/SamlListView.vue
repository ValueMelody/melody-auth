<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { PageTitle } from '@/components/layout'
import { CreateButton, EntityStatusLabel, LoadingPage } from '@/components/shared'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { useSamlIdps } from '@/api/endpoints/saml'
import { Pencil } from 'lucide-vue-next'

const { t } = useI18n()
const { data, isLoading } = useSamlIdps()

const idps = computed(() => data.value ?? [])
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <PageTitle :title="t('saml.title')" class="mb-0" />
      <CreateButton to="/saml/new" :label="'saml.new'" />
    </div>

    <LoadingPage v-if="isLoading" />

    <Table v-else>
      <TableHeader>
        <TableRow>
          <TableHead>{{ t('saml.name') }}</TableHead>
          <TableHead>{{ t('saml.status') }}</TableHead>
          <TableHead>{{ t('saml.userIdAttribute') }}</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="idp in idps" :key="idp.id">
          <TableCell>{{ idp.name }}</TableCell>
          <TableCell>
            <EntityStatusLabel :is-active="idp.isActive" />
          </TableCell>
          <TableCell>{{ idp.userIdAttribute }}</TableCell>
          <TableCell>
            <Button variant="ghost" size="icon" as-child>
              <router-link :to="'/saml/' + idp.id">
                <Pencil class="size-4" />
              </router-link>
            </Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
