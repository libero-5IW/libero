<template>
  <v-app-bar
    color="surface"
    class="horizontal-nav"
    elevation="0"
    height="64"
  >
    <!-- Search bar -->
    <v-text-field
      prepend-inner-icon="mdi-magnify"
      placeholder="Search..."
      variant="solo-filled"
      density="compact"
      color="text-secondary"
      hide-details
      :class="[
        'search-field',
        {
          'mx-4': $vuetify.display.lgAndUp,
          'mx-2': !$vuetify.display.lgAndUp,
          'search-field-lg': $vuetify.display.lgAndUp,
          'search-field-md': !$vuetify.display.lgAndUp
        }
      ]"
      bg-color="secondary-lighten-5"
    />

    <v-spacer />

    <!-- Notifications dropdown -->
    <v-menu
      v-model="showNotifications"
      :close-on-content-click="false"
      location="bottom end"
      offset="5"
      min-width="300"
    >
      <template v-slot:activator="{ props }">
        <v-btn 
          icon 
          v-bind="props"
          :class="{ 'mr-2': $vuetify.display.lgAndUp, 'mr-1': !$vuetify.display.lgAndUp }"
        >
          <v-badge
            color="error"
            :content="unreadCount.toString()"
            :model-value="unreadCount > 0"
          >
            <v-icon>mdi-bell-outline</v-icon>
          </v-badge>
        </v-btn>
      </template>

      <v-card>
        <v-list>
          <v-list-subheader class="d-flex align-center justify-space-between">
            Notifications
            <v-btn
              v-if="unreadCount > 0"
              variant="text"
              density="comfortable"
              size="small"
              @click="markAllAsRead"
            >
              Mark all as read
            </v-btn>
          </v-list-subheader>
          
          <v-list-item
            v-for="notification in notifications"
            :key="notification.id"
            :title="notification.title"
            :subtitle="notification.message"
            :class="{ 'bg-secondary-lighten-5': !notification.read }"
            lines="two"
            @click="handleNotificationClick(notification)"
          >
            <template v-slot:prepend>
              <v-avatar
                :color="notification.color"
                variant="tonal"
                size="32"
              >
                <v-icon :icon="notification.icon"></v-icon>
              </v-avatar>
            </template>
          </v-list-item>

          <v-list-item
            v-if="notifications.length === 0"
            title="No notifications"
            subtitle="You're all caught up!"
          >
            <template v-slot:prepend>
              <v-avatar
                color="secondary"
                variant="tonal"
                size="32"
              >
                <v-icon>mdi-check-circle</v-icon>
              </v-avatar>
            </template>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>

    <!-- User profile dropdown -->
    <v-menu
      v-model="showUserMenu"
      location="bottom end"
      offset="5"
    >
      <template v-slot:activator="{ props }">
        <v-btn 
          icon 
          v-bind="props"
          :class="{ 'mr-4': $vuetify.display.lgAndUp, 'mr-2': !$vuetify.display.lgAndUp }"
        >
          <v-avatar size="32" color="primary">
            <v-icon>mdi-account</v-icon>
          </v-avatar>
        </v-btn>
      </template>

      <v-card min-width="200">
        <v-list>
          <v-list-item
            prepend-icon="mdi-account-circle"
            title="Profile"
            value="profile"
            @click="handleUserMenuClick('profile')"
          />
          <v-list-item
            prepend-icon="mdi-cog"
            title="Settings"
            value="settings"
            @click="handleUserMenuClick('settings')"
          />
          <v-divider />
          <v-list-item
            prepend-icon="mdi-logout"
            title="Logout"
            value="logout"
            color="error"
            @click="logout"
          />
        </v-list>
      </v-card>
    </v-menu>
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth';

const router = useRouter()
const { lgAndUp } = useDisplay()
const showNotifications = ref(false)
const showUserMenu = ref(false)
const authStore = useAuthStore()

// Sample notifications data
const notifications = ref([
  {
    id: 1,
    title: 'New Message',
    message: 'You have received a new message from John Doe',
    icon: 'mdi-message',
    color: 'primary',
    read: false,
    link: '/messages/1'
  },
  {
    id: 2,
    title: 'Task Completed',
    message: 'Project milestone has been achieved',
    icon: 'mdi-check-circle',
    color: 'success',
    read: false,
    link: '/projects/tasks'
  }
])

// Computed property for unread notifications count
const unreadCount = computed(() => 
  notifications.value.filter(n => !n.read).length
)

// Notification handlers
const handleNotificationClick = (notification: any) => {
  // Mark the notification as read
  notification.read = true
  
  // Close the menu
  showNotifications.value = false
  
  // Navigate to the notification's target page if it has a link
  if (notification.link) {
    router.push(notification.link)
  }
}

const markAllAsRead = () => {
  notifications.value.forEach(notification => {
    notification.read = true
  })
}
const logout = async () => {
  await authStore.logout();
}

// User menu handlers
const handleUserMenuClick = (action: string) => {
  showUserMenu.value = false
  
  switch (action) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
  }
}
</script>

<style scoped>
.horizontal-nav {
  border-left: 1px solid rgba(0, 0, 0, 0.12);
}

.search-field {
  border-radius: 8px;
}

.search-field-lg {
  max-width: 300px;
}

.search-field-md {
  max-width: 200px;
}

:deep(.v-field) {
  border-radius: 8px !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
}
</style>
