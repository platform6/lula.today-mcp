export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      areas: {
        Row: {
          archived_at: string | null
          color: string | null
          created_at: string
          deleted_at: string | null
          icon: string | null
          id: string
          name: string
          position: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          color?: string | null
          created_at?: string
          deleted_at?: string | null
          icon?: string | null
          id: string
          name: string
          position: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          archived_at?: string | null
          color?: string | null
          created_at?: string
          deleted_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          position?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      attachments: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          mime_type: string | null
          name: string
          path: string
          size: number
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id: string
          mime_type?: string | null
          name: string
          path: string
          size: number
          task_id: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          mime_type?: string | null
          name?: string
          path?: string
          size?: number
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      board_columns: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          is_done: boolean
          name: string
          position: string
          project_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id: string
          is_done?: boolean
          name: string
          position: string
          project_id: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_done?: boolean
          name?: string
          position?: string
          project_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_columns_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      bus_purchases: {
        Row: {
          bought_on: string
          created_at: string
          deleted_at: string | null
          id: string
          tickets: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bought_on: string
          created_at?: string
          deleted_at?: string | null
          id: string
          tickets?: number
          updated_at?: string
          user_id?: string
        }
        Update: {
          bought_on?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          tickets?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      labels: {
        Row: {
          color: string | null
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          deleted_at?: string | null
          id: string
          name: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      list_items: {
        Row: {
          created_at: string
          deleted_at: string | null
          details: Json
          experienced_on: string | null
          id: string
          list_id: string
          notes: string | null
          rating: number | null
          title: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          details?: Json
          experienced_on?: string | null
          id: string
          list_id: string
          notes?: string | null
          rating?: number | null
          title: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          details?: Json
          experienced_on?: string | null
          id?: string
          list_id?: string
          notes?: string | null
          rating?: number | null
          title?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "list_items_list_id_user_id_fkey"
            columns: ["list_id", "user_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      lists: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          kind: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id: string
          kind: string
          name: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          kind?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          archived_at: string | null
          area_id: string | null
          color: string | null
          completed_at: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          due_date: string | null
          id: string
          is_area_default: boolean
          is_inbox: boolean
          name: string
          position: string
          show_board: boolean
          track_time: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          area_id?: string | null
          color?: string | null
          completed_at?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          id: string
          is_area_default?: boolean
          is_inbox?: boolean
          name: string
          position: string
          show_board?: boolean
          track_time?: boolean
          updated_at?: string
          user_id?: string
        }
        Update: {
          archived_at?: string | null
          area_id?: string | null
          color?: string | null
          completed_at?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_area_default?: boolean
          is_inbox?: boolean
          name?: string
          position?: string
          show_board?: boolean
          track_time?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          created_at: string
          default_columns: Json
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_columns?: Json
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          default_columns?: Json
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      steps: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          is_done: boolean
          position: string
          task_id: string
          text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id: string
          is_done?: boolean
          position: string
          task_id: string
          text: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_done?: boolean
          position?: string
          task_id?: string
          text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "steps_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_labels: {
        Row: {
          created_at: string
          deleted_at: string | null
          label_id: string
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          label_id: string
          task_id: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          label_id?: string
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_labels_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "labels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_labels_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          archived_at: string | null
          cancelled_at: string | null
          column_id: string
          completed_at: string | null
          created_at: string
          deleted_at: string | null
          due_at: string | null
          due_has_time: boolean
          id: string
          notes: string | null
          position: string
          priority: number
          project_id: string
          recurrence: Json | null
          title: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          cancelled_at?: string | null
          column_id: string
          completed_at?: string | null
          created_at?: string
          deleted_at?: string | null
          due_at?: string | null
          due_has_time?: boolean
          id: string
          notes?: string | null
          position: string
          priority?: number
          project_id: string
          recurrence?: Json | null
          title: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Update: {
          archived_at?: string | null
          cancelled_at?: string | null
          column_id?: string
          completed_at?: string | null
          created_at?: string
          deleted_at?: string | null
          due_at?: string | null
          due_has_time?: boolean
          id?: string
          notes?: string | null
          position?: string
          priority?: number
          project_id?: string
          recurrence?: Json | null
          title?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "board_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string | null
          ended_at: string | null
          fields: Json
          id: string
          project_id: string | null
          source: string | null
          started_at: string
          tag_ids: string[]
          time_task_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          ended_at?: string | null
          fields?: Json
          id: string
          project_id?: string | null
          source?: string | null
          started_at: string
          tag_ids?: string[]
          time_task_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          ended_at?: string | null
          fields?: Json
          id?: string
          project_id?: string | null
          source?: string | null
          started_at?: string
          tag_ids?: string[]
          time_task_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_time_task_id_fkey"
            columns: ["time_task_id"]
            isOneToOne: false
            referencedRelation: "time_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      time_fields: {
        Row: {
          archived_at: string | null
          choices: Json
          created_at: string
          deleted_at: string | null
          id: string
          kind: string
          name: string
          position: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          choices?: Json
          created_at?: string
          deleted_at?: string | null
          id: string
          kind?: string
          name: string
          position: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          archived_at?: string | null
          choices?: Json
          created_at?: string
          deleted_at?: string | null
          id?: string
          kind?: string
          name?: string
          position?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      time_tags: {
        Row: {
          archived_at: string | null
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          deleted_at?: string | null
          id: string
          name: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      time_tasks: {
        Row: {
          archived_at: string | null
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          project_id: string | null
          task_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          deleted_at?: string | null
          id: string
          name: string
          project_id?: string | null
          task_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          project_id?: string | null
          task_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      work_days: {
        Row: {
          created_at: string
          day: string
          deleted_at: string | null
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day: string
          deleted_at?: string | null
          id: string
          status: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          day?: string
          deleted_at?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive_completed_tasks: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
