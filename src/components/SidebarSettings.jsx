import { 
  SecondarySidebar, 
  SecondarySidebarSection, 
  SecondarySidebarItem 
} from './SecondarySidebar'

function SidebarSettings() {
  return (
    <SecondarySidebar>
      <SecondarySidebarSection title="Settings">
        <SecondarySidebarItem 
          to="/settings/profile" 
          label="Your profile" 
          defaultPath={{ base: '/settings', target: '/settings/profile' }}
        />
        <SecondarySidebarItem 
          to="/settings/trash" 
          label="Trash" 
        />
      </SecondarySidebarSection>

      <SecondarySidebarSection title="Organization">
        <SecondarySidebarItem to="/settings/organization/general" label="General" />
        <SecondarySidebarItem to="/settings/organization/api-keys" label="API keys" />
        <SecondarySidebarItem to="/settings/organization/admin-keys" label="Admin keys" />
        <SecondarySidebarItem to="/settings/organization/people" label="People" />
        <SecondarySidebarItem to="/settings/organization/projects" label="Projects" />
        <SecondarySidebarItem to="/settings/organization/billing" label="Billing" />
        <SecondarySidebarItem to="/settings/organization/limits" label="Limits" />
        <SecondarySidebarItem to="/settings/organization/usage" label="Usage" />
        <SecondarySidebarItem to="/settings/organization/service-health" label="Service health" />
        <SecondarySidebarItem to="/settings/organization/data-controls" label="Data controls" />
        <SecondarySidebarItem to="/settings/organization/security" label="Security" />
      </SecondarySidebarSection>

      <SecondarySidebarSection title="Project">
        <SecondarySidebarItem to="/settings/project/general" label="General" />
        <SecondarySidebarItem to="/settings/project/api-keys" label="API keys" />
        <SecondarySidebarItem to="/settings/project/webhooks" label="Webhooks" />
        <SecondarySidebarItem to="/settings/project/evaluations" label="Evaluations" />
        <SecondarySidebarItem to="/settings/project/people" label="People" />
        <SecondarySidebarItem to="/settings/project/limits" label="Limits" />
      </SecondarySidebarSection>
    </SecondarySidebar>
  )
}

export default SidebarSettings
