import {
  alliance_earnings_table,
  alliance_member_table,
  alliance_referral_link_table,
  user_table,
} from "@prisma/client";
import prisma from "./prisma";
import { createClientServerSide } from "./supabase/server";

export const protectionRegisteredUser = async () => {
  const supabase = await createClientServerSide();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    return { redirect: "/" };
  }
};

export const refreshSession = async () => {
  const supabase = await createClientServerSide();
  const { data, error } = await supabase.auth.refreshSession();
  if (error) {
    return false;
  }
  if (data) {
    return true;
  }
};

export const ensureValidSession = async () => {
  const supabase = await createClientServerSide();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return false;
  }
  if (session.expires_at && session.expires_at * 1000 < Date.now() + 60000) {
    return await refreshSession();
  }
  return true;
};

export const protectionAdminUser = async () => {
  try {
    const supabase = await createClientServerSide();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
      return { redirect: "/auth/login" };
    }

    const userId = data.user.id;

    // Fetch the user profile
    const profile = await prisma.user_table.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      return { redirect: "/500" }; // Redirect if the profile is not found
    }

    // Check if the user is an admin in the alliance
    const teamMember = await prisma.alliance_member_table.findFirst({
      where: { alliance_member_user_id: profile.user_id },
    });

    if (
      !teamMember?.alliance_member_alliance_id ||
      (teamMember.alliance_member_role !== "ADMIN" &&
        teamMember.alliance_member_role !== "MERCHANT")
    ) {
      return { redirect: "/500" };
    }

    if (teamMember.alliance_member_restricted) {
      return { redirect: "/500" };
    }

    return {
      profile: profile as user_table,
      teamMemberProfile: teamMember as alliance_member_table,
    };
  } catch (e) {
    return { redirect: "/error" };
  }
};

export const protectionMemberUser = async () => {
  const supabase = await createClientServerSide();

  const { data } = await supabase.auth.getUser();

  if (!data?.user) {
    return { redirect: "/auth/login" };
  }

  const profile = await prisma.user_table.findUnique({
    where: { user_id: data.user.id },
  });

  if (!profile) return { redirect: "/500" };

  const teamMember = await prisma.alliance_member_table.findFirst({
    where: { alliance_member_user_id: profile.user_id },
  });

  const referal = await prisma.alliance_referral_link_table.findFirst({
    where: {
      alliance_referral_link_member_id: teamMember?.alliance_member_id,
    },
  });

  if (
    !teamMember?.alliance_member_alliance_id ||
    (teamMember.alliance_member_role !== "MEMBER" &&
      teamMember.alliance_member_role !== "ADMIN" &&
      teamMember.alliance_member_role !== "MERCHANT")
  ) {
    return { redirect: "/404" };
  }

  if (teamMember.alliance_member_restricted) {
    return { redirect: "/500" };
  }

  const earnings = await prisma.alliance_earnings_table.findFirst({
    where: { alliance_earnings_member_id: teamMember.alliance_member_id },
  });

  if (!earnings) {
    return { redirect: "/404" };
  }

  return {
    profile: profile as user_table,
    teamMemberProfile: teamMember as alliance_member_table,
    earnings: earnings as alliance_earnings_table,
    referal: referal as alliance_referral_link_table,
  };
};
