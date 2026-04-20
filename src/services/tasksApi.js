import supabase from "./supabase";

export const tasksApi = {
  async getByProject(projectId) {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("position", { ascending: true });
    if (error) throw error;
    return data;
  },

  async create(task) {
    const { data, error } = await supabase
      .from("tasks")
      .insert(task)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw error;
  },

  async getComments(taskId) {
    const { data, error } = await supabase
      .from("comments")
      .select("*, profiles(full_name, email)")
      .eq("task_id", taskId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data;
  },

  async addComment(comment) {
    const { data, error } = await supabase
      .from("comments")
      .insert(comment)
      .select("*, profiles(full_name, email)")
      .single();
    if (error) throw error;
    return data;
  },

  async deleteComment(id) {
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) throw error;
  },
};
